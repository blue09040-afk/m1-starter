# PDF Reading Kit Workflow (starter)

## 1. 목적

이 문서는 `m1-starter`의 경량 `PDF_READING_KIT`으로 PDF를 로컬 우선 방식으로 Markdown에 추출하고, 필요한 경우에만 선택적으로 OCR을 사용하는 절차를 정합니다.

상세한 PDF 판독 기준은 `skills/pdf-reading-kit/references/PDF_TEXT_EXTRACTION_GUIDE.md`를 따르며, 이 문서는 starter에 실제 포함된 실행 소스의 사용 순서와 외부 전송 경계만 다룹니다.

## 2. 기본 원칙

1. 원본 PDF는 수정하거나 덮어쓰지 않습니다.
2. 먼저 `-Mode text`로 로컬 텍스트 레이어를 추출합니다.
3. 로컬 추출이 충분하면 OCR이나 외부 서비스를 사용하지 않습니다.
4. `-Mode auto` 또는 `-Mode ocr`은 Gemini API로 PDF 내용 또는 조각을 전송할 수 있으므로 민원·감사·비공개 자료에는 조직 정책 확인과 명시적 승인이 필요합니다.
5. 개인정보 마스킹은 기본값이 아니며 필요한 경우에만 `-MaskPii`를 사용합니다.
6. OCR·추출 결과는 참고자료이며 날짜, 금액, 문서번호, 고유명사, 조문 등 중요한 값은 원본으로 재확인합니다.
7. starter에는 OneOCR DLL/runtime, Tesseract 설치본, Windows OCR 구성, Python `vendor/`를 포함하지 않습니다. 필요한 로컬 OCR 엔진은 각 사용자 환경에서 별도로 구성합니다.

## 3. 설치

`tools/PDF_READING_KIT`에서 Python 가상환경을 만들고 의존성을 설치합니다.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

API 키가 필요한 경우 실제 값은 `.env` 또는 환경변수에 두고 Git에 커밋하지 않습니다. 저장소에는 `.env.example`만 유지합니다.

## 4. 기본 실행 순서

### 4.1 로컬 텍스트 추출

```powershell
.\tools\pdf_to_md.ps1 -Target "C:\path\document.pdf" -Mode text
```

이 경로는 PDF의 기존 텍스트 레이어를 사용하며 Gemini API를 호출하지 않습니다.

### 4.2 명시적 개인정보 마스킹

AI 검토용 Markdown에 마스킹이 필요한 경우에만 다음처럼 실행합니다.

```powershell
.\tools\pdf_to_md.ps1 -Target "C:\path\document.pdf" -Mode text -MaskPii
```

마스킹 결과만 보고 원본의 중요 값을 확정하지 않습니다.

### 4.3 로컬 결과가 부족한 경우

먼저 다음을 구분합니다.

- 이미지 전용 PDF인지
- 일부 페이지만 이미지인지
- 뷰어에서는 보이지만 텍스트 추출이 실패하는 인코딩·구조 문제인지
- 권한 제한 또는 손상 파일인지

판단 기준은 `skills/pdf-reading-kit/references/PDF_TEXT_EXTRACTION_GUIDE.md`의 관련 절을 확인합니다.

starter의 기본 실행 소스에서 OCR을 사용할 필요가 있고 외부 전송이 허용된 경우에만 `-Mode auto` 또는 `-Mode ocr`을 사용합니다. 이 경로는 Gemini API 전송 가능성이 있으므로 대상 문서와 전송 서비스에 대한 승인을 먼저 확인합니다.

```powershell
.\tools\pdf_to_md.ps1 -Target "C:\path\document.pdf" -Mode auto
```

## 5. 로컬 OCR을 별도로 구성하는 경우

OneOCR, Tesseract, Windows OCR 등 로컬 OCR 엔진을 별도로 설치했다면 조직 정책과 해당 엔진의 신뢰도를 확인한 뒤 보조 판독에 사용할 수 있습니다. starter는 특정 PC의 런타임 경로나 바이너리를 전제로 하지 않으며, 원본 `m1`의 PC 종속 실행 묶음을 자동으로 복원하거나 다운로드하지 않습니다.

로컬 OCR 결과도 자동 정답으로 취급하지 않고 중요한 수치·문구는 원본 화면과 대조합니다.

## 6. 보관·공유 경계

다음 항목은 Git에 올리지 않습니다.

- 실제 `.env`, API 키, 토큰
- 사건 PDF와 추출·OCR 결과
- `output/`, cache, 임시 조각
- OneOCR DLL·모델, OCR runtime, 설치파일
- Python 가상환경과 vendored package

직원 공유용 starter에는 재사용 가능한 소스·설정·안내만 남깁니다.
