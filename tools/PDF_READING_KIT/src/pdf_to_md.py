from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable

SRC_DIR = Path(__file__).resolve().parent
VENDOR = SRC_DIR.parent / "vendor"
for import_dir in (SRC_DIR, VENDOR):
    if import_dir.exists() and str(import_dir) not in sys.path:
        sys.path.insert(0, str(import_dir))

from pypdf import PdfReader, PdfWriter
from pii_masking_core import mask_text

DEFAULT_MODEL = "gemini-3.1-flash-lite"
DEFAULT_CHUNK_SIZE = 8
AUTO_PARALLEL_MIN_CHUNKS = 3
AUTO_PARALLEL_WORKERS = 2
TEXT_PAGE_THRESHOLD = 80
TEXT_DOC_THRESHOLD = 250

@dataclass
class PageProfile:
    page_number: int
    text: str
    image_count: int

@dataclass
class PdfProfile:
    path: Path
    page_count: int
    pages: list[PageProfile]
    classification: str
    reason: str

    @property
    def extracted_text_chars(self) -> int:
        return sum(len(page.text.strip()) for page in self.pages)

def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

def safe_stem(path: Path) -> str:
    return re.sub(r'[\\/:*?"<>|]+', "_", path.stem).strip() or "document"

def iter_pdf_targets(target: Path) -> list[Path]:
    if target.is_file():
        if target.suffix.lower() != ".pdf":
            raise SystemExit(f"PDF 파일이 아닙니다: {target}")
        return [target]
    if target.is_dir():
        pdfs = sorted(target.glob("*.pdf"))
        if not pdfs:
            raise SystemExit(f"PDF 파일을 찾지 못했습니다: {target}")
        return pdfs
    raise SystemExit(f"대상을 찾지 못했습니다: {target}")

def count_page_images(page) -> int:
    try:
        return len(page.images)
    except Exception:
        resources = page.get("/Resources") or {}
        xobj = resources.get("/XObject") if hasattr(resources, "get") else None
        if not xobj:
            return 0
        count = 0
        try:
            for obj in xobj.get_object().values():
                if obj.get_object().get("/Subtype") == "/Image":
                    count += 1
        except Exception:
            return 0
        return count

def profile_pdf(path: Path) -> PdfProfile:
    reader = PdfReader(str(path))
    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception:
            pass
    pages: list[PageProfile] = []
    for idx, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
        pages.append(PageProfile(idx, text, count_page_images(page)))
    total_chars = sum(len(page.text.strip()) for page in pages)
    text_pages = sum(1 for page in pages if len(page.text.strip()) >= TEXT_PAGE_THRESHOLD)
    image_pages = sum(1 for page in pages if page.image_count > 0)
    if total_chars >= TEXT_DOC_THRESHOLD and text_pages >= max(1, len(pages) // 2):
        classification = "text"
        reason = f"텍스트 추출 가능: {total_chars}자, 텍스트 페이지 {text_pages}/{len(pages)}"
    elif total_chars > 0 and image_pages > 0:
        classification = "mixed"
        reason = f"텍스트와 이미지가 혼합됨: {total_chars}자, 이미지 페이지 {image_pages}/{len(pages)}"
    else:
        classification = "ocr"
        reason = f"추출 가능한 텍스트 부족: {total_chars}자, 이미지 페이지 {image_pages}/{len(pages)}"
    return PdfProfile(path, len(pages), pages, classification, reason)

def build_text_markdown(profile: PdfProfile) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = [f"# {profile.path.stem} 텍스트 변환본", "", "## 문서 정보", f"- 원본 파일: `{profile.path.name}`", f"- 변환일: {now}", "- 처리 방식: PDF 텍스트 레이어 추출", f"- 페이지 수: {profile.page_count}", f"- 추출 문자 수: {profile.extracted_text_chars}", "", "## 주의사항", "- 이 결과는 PDF 내부 텍스트 객체에서 추출한 것입니다.", "- OCR 보정이나 문맥상 오탈자 수정은 적용하지 않았습니다.", "- 표, 줄바꿈, 좌표 기반 배치는 원본 화면과 다를 수 있습니다.", "", "## 페이지별 원문", ""]
    for page in profile.pages:
        lines.extend([f"### p.{page.page_number}", "", page.text.strip() or "[추출된 텍스트 없음]", ""])
    return "\n".join(lines).rstrip() + "\n"

def chunk_ranges(page_count: int, chunk_size: int) -> Iterable[tuple[int, int]]:
    start = 1
    while start <= page_count:
        end = min(page_count, start + chunk_size - 1)
        yield start, end
        start = end + 1

def write_pdf_chunk(source: Path, out_path: Path, start_page: int, end_page: int) -> None:
    reader = PdfReader(str(source))
    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception:
            pass
    writer = PdfWriter()
    for page_index in range(start_page - 1, end_page):
        writer.add_page(reader.pages[page_index])
    out_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(mode="w+b", delete=False, dir=out_path.parent, prefix=f".{out_path.name}.", suffix=".tmp") as handle:
            writer.write(handle)
            handle.flush()
            os.fsync(handle.fileno())
            temp_path = Path(handle.name)
        os.replace(temp_path, out_path)
        temp_path = None
    finally:
        if temp_path is not None:
            try:
                temp_path.unlink()
            except FileNotFoundError:
                pass

def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", newline="", delete=False, dir=path.parent, prefix=f".{path.name}.", suffix=".tmp") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
            temp_path = Path(handle.name)
        os.replace(temp_path, path)
        temp_path = None
    finally:
        if temp_path is not None:
            try:
                temp_path.unlink()
            except FileNotFoundError:
                pass

def masked_chunk_path(chunk_dir: Path, start: int, end: int, mask_pii: bool) -> Path:
    return chunk_dir / f"chunk_pages_{start:03d}-{end:03d}{'.masked.md' if mask_pii else '.md'}"

def build_ocr_prompt(filename: str, start_page: int, end_page: int) -> str:
    page_range = f"p.{start_page}" if start_page == end_page else f"p.{start_page}~p.{end_page}"
    return f"""이 PDF 조각은 원본 파일 `{filename}`의 {page_range} 범위입니다.

목표:
이 범위를 AI 검토용 Markdown으로 최대한 원문에 가깝게 전사해줘.

규칙:
1. 요약하지 말 것.
2. 내용을 생략하지 말 것.
3. 표는 가능한 한 Markdown 표로 복원할 것.
4. 문맥상 명백한 OCR 오탈자는 수정하되, 수정 내역을 별도로 적을 것.
5. 확실하지 않은 글자, 숫자, 이름, 금액, 날짜는 추정하지 말고 `[확인 필요]`로 표시할 것.
6. 없는 내용을 만들어내지 말 것.
7. 원본의 페이지 번호를 `### p.N` 형식으로 유지할 것.
8. 개인정보는 결과 생성 목적 외에 별도로 분류, 수집, 재사용하지 말 것.
9. 출력은 Markdown만 작성할 것.

## 문맥상 오탈자 수정 내역

| 위치 | 원문 후보 | 수정 | 이유 |
|---|---|---|---|

## 확인 필요 항목

- 없음

## 원문 변환: {page_range}

### p.{start_page}
"""

def gemini_generate_markdown(pdf_path: Path, prompt: str, model: str, api_key: str, timeout: int = 180) -> dict:
    encoded_pdf = base64.b64encode(pdf_path.read_bytes()).decode("ascii")
    payload = {"contents": [{"role": "user", "parts": [{"text": prompt}, {"inline_data": {"mime_type": "application/pdf", "data": encoded_pdf}}]}], "generationConfig": {"temperature": 0.1, "topP": 0.8}}
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    query = urllib.parse.urlencode({"key": api_key})
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?{query}"
    request = urllib.request.Request(url, data=data, method="POST", headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        error = RuntimeError(f"Gemini API 오류 {exc.code}: {detail}")
        error.http_code = exc.code
        raise error from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Gemini API 연결 실패: {exc}") from exc

def extract_response_text(response: dict) -> str:
    parts = []
    for candidate in response.get("candidates") or []:
        for part in (candidate.get("content") or {}).get("parts") or []:
            if "text" in part:
                parts.append(part["text"])
    return "\n".join(parts).strip()

def validate_ocr_chunk(text: str, start_page: int, end_page: int) -> list[str]:
    problems = []
    for heading in ["## 문맥상 오탈자 수정 내역", "## 확인 필요 항목", "## 원문 변환"]:
        if heading not in text:
            problems.append(f"필수 섹션 누락: {heading}")
    for page in range(start_page, end_page + 1):
        if f"### p.{page}" not in text:
            problems.append(f"페이지 표식 누락: ### p.{page}")
    return problems

def generate_with_retries(chunk_pdf: Path, prompt: str, model: str, api_key: str, retries: int, retry_sleep: float, timeout: int) -> dict:
    attempt = 0
    while True:
        attempt += 1
        try:
            return gemini_generate_markdown(chunk_pdf, prompt, model, api_key, timeout=timeout)
        except RuntimeError as exc:
            http_code = getattr(exc, "http_code", None)
            if http_code not in {429, 500, 502, 503, 504} or attempt > retries:
                raise
            time.sleep(retry_sleep * attempt)

def build_ocr_markdown_header(profile: PdfProfile, model: str, chunk_size: int) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return "\n".join([f"# {profile.path.stem} OCR 변환본", "", "## 문서 정보", f"- 원본 파일: `{profile.path.name}`", f"- 변환일: {now}", "- 처리 방식: Gemini API OCR", f"- 모델: `{model}`", f"- 페이지 수: {profile.page_count}", f"- 분할 크기: {chunk_size}페이지", f"- 자동 판별: {profile.classification} ({profile.reason})", "", "## 주의사항", "- 원문에 최대한 가깝게 전사하도록 요청했습니다.", "- 판독이 불확실한 부분은 `[확인 필요]`로 표시됩니다.", "", "---", ""])

def process_ocr_chunk(profile: PdfProfile, chunk_dir: Path, start: int, end: int, model: str, api_key: str, retries: int, retry_sleep: float, timeout: int, resume: bool, mask_pii: bool, preserve_values: list[str], mask_values: list[str]) -> dict:
    chunk_md = masked_chunk_path(chunk_dir, start, end, mask_pii)
    if resume and chunk_md.exists():
        existing_text = chunk_md.read_text(encoding="utf-8")
        if not validate_ocr_chunk(existing_text, start, end):
            return {"start_page": start, "end_page": end, "text": existing_text.rstrip(), "manifest": {"start_page": start, "end_page": end, "chunk_md": str(chunk_md), "reused": True, "masked": mask_pii}}
    prompt = build_ocr_prompt(profile.path.name, start, end)
    temporary_chunk: Path | None = None
    if mask_pii:
        with tempfile.NamedTemporaryFile(suffix=".pdf", prefix="pdf_to_md_", delete=False) as handle:
            temporary_chunk = Path(handle.name)
        chunk_pdf = temporary_chunk
    else:
        chunk_pdf = chunk_dir / f"pages_{start:03d}-{end:03d}.pdf"
    try:
        write_pdf_chunk(profile.path, chunk_pdf, start, end)
        response = generate_with_retries(chunk_pdf, prompt, model, api_key, retries, retry_sleep, timeout)
    finally:
        if temporary_chunk is not None:
            try:
                temporary_chunk.unlink()
            except FileNotFoundError:
                pass
    text = extract_response_text(response)
    if not text:
        raise RuntimeError(f"Gemini 응답에서 텍스트를 찾지 못했습니다: p.{start}-{end}")
    problems = validate_ocr_chunk(text, start, end)
    if problems:
        raise RuntimeError(f"Gemini 응답 형식 검증 실패 p.{start}-{end}: {'; '.join(problems)}")
    matches = []
    if mask_pii:
        text, matches = mask_text(text, preserve_values=preserve_values, mask_values=mask_values)
    text = text.rstrip()
    atomic_write_text(chunk_md, text + "\n")
    return {"start_page": start, "end_page": end, "text": text, "matches": matches, "manifest": {"start_page": start, "end_page": end, "chunk_md": str(chunk_md), "usage_metadata": response.get("usageMetadata", {}), "masked": mask_pii}}

def convert_with_gemini(profile: PdfProfile, output_md: Path, chunk_dir: Path, model: str, api_key: str, chunk_size: int, sleep_seconds: float, retries: int, retry_sleep: float, timeout: int, resume: bool, parallel: int, mask_pii: bool, preserve_values: list[str], mask_values: list[str]) -> dict:
    output_md.parent.mkdir(parents=True, exist_ok=True)
    chunk_dir.mkdir(parents=True, exist_ok=True)
    ranges = list(chunk_ranges(profile.page_count, chunk_size))
    if parallel == 0:
        parallel = AUTO_PARALLEL_WORKERS if len(ranges) >= AUTO_PARALLEL_MIN_CHUNKS else 1
    results_by_start: dict[int, dict] = {}
    if parallel <= 1:
        for start, end in ranges:
            results_by_start[start] = process_ocr_chunk(profile, chunk_dir, start, end, model, api_key, retries, retry_sleep, timeout, resume, mask_pii, preserve_values, mask_values)
            if sleep_seconds > 0:
                time.sleep(sleep_seconds)
    else:
        with ThreadPoolExecutor(max_workers=parallel) as executor:
            future_map = {executor.submit(process_ocr_chunk, profile, chunk_dir, start, end, model, api_key, retries, retry_sleep, timeout, resume, mask_pii, preserve_values, mask_values): (start, end) for start, end in ranges}
            for future in as_completed(future_map):
                start, _ = future_map[future]
                results_by_start[start] = future.result()
    ordered = [results_by_start[start] for start, _ in ranges]
    final_text = build_ocr_markdown_header(profile, model, chunk_size) + "\n\n---\n\n".join(result["text"] for result in ordered).rstrip() + "\n"
    final_matches = []
    if mask_pii:
        final_text, final_matches = mask_text(final_text, preserve_values=preserve_values, mask_values=mask_values)
    atomic_write_text(output_md, final_text)
    return {"chunks": [result["manifest"] for result in ordered], "mask_matches": [match for result in ordered for match in result.get("matches", [])] + final_matches}

def convert_one(pdf_path: Path, args: argparse.Namespace, project_root: Path) -> dict:
    profile = profile_pdf(pdf_path)
    name = safe_stem(pdf_path)
    output_md = project_root / args.output_dir / f"{name}{'_masked' if args.mask_pii else ''}.md"
    chunk_dir = project_root / args.chunk_dir / name
    should_ocr = args.mode == "ocr" or (args.mode == "auto" and profile.classification != "text")
    if args.mode == "text":
        should_ocr = False
    result = {"source": str(pdf_path), "output": str(output_md), "classification": profile.classification, "reason": profile.reason, "page_count": profile.page_count, "mode": args.mode, "used_ocr": should_ocr}
    matches = []
    if should_ocr:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY가 없습니다. .env 또는 환경변수에 설정해 주세요.")
        ocr_result = convert_with_gemini(profile, output_md, chunk_dir, args.model, api_key, args.chunk_size, args.sleep, args.retries, args.retry_sleep, args.timeout, not args.no_resume, args.parallel, args.mask_pii, args.preserve_value, args.mask_value)
        result.update(ocr_result)
        matches = ocr_result.pop("mask_matches", [])
    else:
        text = build_text_markdown(profile)
        if args.mask_pii:
            text, matches = mask_text(text, preserve_values=args.preserve_value, mask_values=args.mask_value)
        atomic_write_text(output_md, text)
    result["masking"] = {"enabled": args.mask_pii, "match_count": len(matches)} if args.mask_pii else {"enabled": False}
    return result

def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="PDF를 AI 검토용 Markdown으로 변환합니다.")
    parser.add_argument("target")
    parser.add_argument("--mode", choices=["auto", "text", "ocr"], default="text")
    parser.add_argument("--model", default=os.environ.get("GEMINI_MODEL", DEFAULT_MODEL))
    parser.add_argument("--chunk-size", type=int, default=DEFAULT_CHUNK_SIZE)
    parser.add_argument("--output-dir", default="output/md")
    parser.add_argument("--chunk-dir", default="output/chunks")
    parser.add_argument("--manifest-dir", default="output/logs")
    parser.add_argument("--sleep", type=float, default=0.0)
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--retry-sleep", type=float, default=10.0)
    parser.add_argument("--timeout", type=int, default=180)
    parser.add_argument("--no-resume", action="store_true")
    parser.add_argument("--parallel", type=int, default=0)
    parser.add_argument("--mask-pii", action="store_true")
    parser.add_argument("--preserve-value", action="append", default=[])
    parser.add_argument("--mask-value", action="append", default=[])
    return parser.parse_args(argv)

def main(argv: list[str] | None = None) -> int:
    project_root = Path.cwd()
    load_dotenv(project_root / ".env")
    args = parse_args(argv or sys.argv[1:])
    if args.parallel < 0 or args.parallel > 3:
        raise SystemExit("--parallel 값은 0~3이어야 합니다.")
    targets = iter_pdf_targets(Path(args.target))
    manifest_dir = project_root / args.manifest_dir
    manifest_dir.mkdir(parents=True, exist_ok=True)
    all_results, errors = [], []
    for pdf in targets:
        try:
            all_results.append(convert_one(pdf.resolve(), args, project_root))
        except Exception as exc:
            errors.append({"source": str(pdf), "error": str(exc)})
    manifest = {"created_at": datetime.now().isoformat(timespec="seconds"), "target": args.target, "results": all_results, "errors": errors}
    atomic_write_text(manifest_dir / f"pdf_to_md_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json", json.dumps(manifest, ensure_ascii=False, indent=2))
    return 1 if errors else 0

if __name__ == "__main__":
    raise SystemExit(main())
