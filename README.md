# m1-starter

이 저장소는 실제 업무에서 사용하던 `m1` 지침·스킬·프롬프트·문서처리 도구를 출발점으로 제공하는 **독립 운영용 starter**입니다.

처음 복제하거나 전달받았다면 먼저 [`STARTER_GUIDE.md`](STARTER_GUIDE.md)를 확인하세요.

## 사용 원칙

- 이 저장소의 규칙은 팀 전체의 강제 표준이 아닙니다.
- 자신의 담당업무, 조직 정책, PC 환경과 사용 모델에 맞게 자유롭게 수정·삭제·추가할 수 있습니다.
- 원본 제공자의 `m1`과 자동 동기화되지 않습니다. 필요한 개선만 선택적으로 반영합니다.
- 기존 문서에 등장하는 특정 PC 경로·사용환경은 운영 사례 또는 예시일 수 있으며, 현재 사용자의 환경에 맞게 바꿉니다.
- 특정 업무용 스킬(예: 화성시 담당부서 확인, 권익위·공익신고·진정민원·일상감사)은 필요할 때만 사용하며, 필요 없으면 제거해도 됩니다.

## 시작점

- Codex: `AGENTS.md`
- 일반 ChatGPT: `CHATGPT_ENTRYPOINT.md`
- Grok 일반 Chat 폴백: `GROK_ENTRYPOINT.md`
- 공통 행정문서 판단 기준: `guides/BASE_INSTRUCTIONS.md`
- 업무별 실행 절차: `skills/`
- 반복 입력문: `prompts/`
- 로컬 문서처리 보조도구: `tools/`

## 처음 사용할 때

1. 이 starter를 자신의 **Private** 저장소로 복제합니다.
2. `AGENTS.md`와 필요한 진입점을 읽고 현재 담당업무에 불필요한 스킬·프롬프트를 정리합니다.
3. 조직의 GitHub·외부 AI·개인정보 정책에 맞게 PC 환경별 동기화 규칙을 조정합니다.
4. Codex 스킬을 로컬에 설치할 경우 `tools/sync_codex_skills.ps1`을 먼저 `-DryRun`으로 확인합니다.
5. HWPX Kordoc runtime을 사용할 경우 `.github/workflows/hwpx-kordoc-check.yml`의 첫 성공 실행을 확인합니다.

## 포함 범위

- `AGENTS.md`, `CHATGPT_ENTRYPOINT.md`, `GROK_ENTRYPOINT.md`
- `guides/`, `skills/`, `prompts/`
- 재사용 가능한 `tools/`의 소스·설명·설정
- 비식별 예시 및 템플릿
- HWPX Kordoc 검증 workflow

## 포함하지 않는 것

- 실제 사건 원자료와 사건별 결과물
- API 키, 토큰, 쿠키, `.env` 실제 값
- OneOCR DLL·모델, HWPX 변환기 등 로컬 런타임·설치파일
- PDF 도구의 vendored Python 패키지 사본
- 개인 `LLM_Wiki/`, 개선 이력, 과거 백업과 비공유 보관자료
- 기존 Actions 실행 이력·artifact·cache·Secrets·Variables·Ruleset

`tools/PDF_READING_KIT`은 starter에서 소스와 설치정보만 제공하며 `vendor/`는 포함하지 않습니다. 필요한 Python 의존성은 해당 도구의 `requirements.txt`와 안내문을 기준으로 각 환경에서 설치합니다.

## 원본과의 관계

이 저장소를 복제한 이후에는 새 저장소가 각 사용자의 정본입니다. 원본 제공자의 규칙이나 이후 변경을 자동으로 따라갈 필요가 없으며, 자신의 업무에 맞는 하나의 정본 구조를 유지하는 것을 권장합니다.
