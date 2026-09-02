# PDF_READING_KIT (starter)

PDF를 로컬에서 먼저 읽고 필요할 때만 외부 OCR을 사용하기 위한 경량 starter입니다.

상세 실행 순서와 외부 전송 경계는 `guides/PDF_READING_KIT_WORKFLOW.md`를 확인하세요.

## 설치

```powershell
cd tools\PDF_READING_KIT
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## 기본 사용

외부 전송 없이 PDF 텍스트 레이어만 Markdown으로 추출:

```powershell
.\tools\pdf_to_md.ps1 -Target "C:\path\document.pdf" -Mode text
```

개인정보 마스킹을 함께 적용:

```powershell
.\tools\pdf_to_md.ps1 -Target "C:\path\document.pdf" -Mode text -MaskPii
```

`-Mode auto` 또는 `-Mode ocr`은 Gemini API로 PDF 조각을 전송할 수 있습니다. 민원·감사·비공개 자료는 조직 정책과 외부전송 가능 여부를 확인한 뒤 사용하세요. API 키는 실제 `.env` 또는 환경변수에 두고 Git에 커밋하지 않습니다.

## starter 차이

원본 운영환경의 `vendor/`, OneOCR DLL/runtime, Windows OCR/Tesseract 설치본과 캐시는 포함하지 않습니다. 필요한 로컬 OCR 엔진은 각 사용자 환경에서 별도로 설치·구성합니다.

`src/pdf_to_md.py`는 텍스트 레이어 추출과 선택적 Gemini OCR을, `src/pii_masking_core.py`는 기본적인 개인정보 패턴 마스킹을 제공합니다. OCR 결과는 원문 검증을 대체하지 않습니다.
