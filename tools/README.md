# m1-starter tools

이 폴더는 다른 사용자가 독립 저장소로 복제한 뒤 필요한 도구만 설치·수정해 사용할 수 있도록 경량 소스만 제공합니다.

## 포함

- `sync_codex_skills.ps1`: 이 저장소의 `skills/`를 로컬 Codex skills 폴더로 동기화
- `PDF_READING_KIT/`: PDF 텍스트 추출·선택적 Gemini OCR·개인정보 마스킹의 소스와 설치정보

## 의도적으로 제외

- OneOCR DLL·Snipping Tool runtime·OCR 모델
- Python `vendor/`, 가상환경, `node_modules`
- 실제 `.env`, API 키, 토큰
- 실제 사건 PDF/HWPX와 변환 결과
- PC별 설치파일·캐시·로그

필요한 runtime은 각 사용자 PC에서 설치하거나 자신의 환경에 맞게 별도로 구성합니다. 원본 제공자의 로컬 경로나 runtime을 그대로 재현할 필요는 없습니다.
