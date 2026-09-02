# m1-starter

이 저장소는 실제 업무에서 사용하던 `m1` 지침·스킬·프롬프트·문서처리 도구를 출발점으로 제공하는 **독립 운영용 starter**입니다.

> **공개 템플릿 주의:** 이 저장소 자체에는 실제 사건자료·개인정보·비공개 문서를 업로드하지 마세요. `Use this template`로 자신의 **Private 저장소**를 만든 뒤 실제 업무는 그 저장소에서 수행합니다.

처음 복제하거나 전달받았다면 먼저 [`STARTER_GUIDE.md`](STARTER_GUIDE.md)를 확인하세요. 실제 업무에서 자주 쓰는 요청 예시는 [`QUICK_START.md`](QUICK_START.md), ChatGPT 프로젝트 상위 지침 권장안은 [`PROJECT_INSTRUCTIONS_RECOMMENDED.md`](PROJECT_INSTRUCTIONS_RECOMMENDED.md)에 정리되어 있습니다.

## 사용 원칙

- 이 저장소의 규칙은 팀 전체의 강제 표준이 아닙니다.
- 자신의 담당업무, 조직 정책, PC 환경과 사용 모델에 맞게 자유롭게 수정·삭제·추가할 수 있습니다.
- 원본 제공자의 `m1`과 자동 동기화되지 않습니다. 필요한 개선만 선택적으로 반영합니다.
- 기존 문서에 등장하는 특정 PC 경로·사용환경은 운영 사례 또는 예시일 수 있으며, 현재 사용자의 환경에 맞게 바꿉니다.
- 특정 업무용 스킬(예: 화성시 담당부서 확인, 권익위·공익신고·진정민원)은 필요할 때만 사용하며, 필요 없으면 제거해도 됩니다. 일상감사는 별도 skill 대신 `prompts/chat_mode/일상감사 검토/`의 전용 업무 프로필을 사용합니다.

## 시작점

- Codex: `AGENTS.md`
- 일반 ChatGPT: `CHATGPT_ENTRYPOINT.md`
- Grok 일반 Chat 폴백: `GROK_ENTRYPOINT.md`
- 공통 행정문서 판단 기준: `guides/BASE_INSTRUCTIONS.md`
- 업무별 실행 절차: `skills/`
- 반복 입력문: `prompts/`
- 로컬 문서처리 보조도구: `tools/`
- 직원용 업무 예시: `QUICK_START.md`
- ChatGPT 프로젝트 지침 권장안: `PROJECT_INSTRUCTIONS_RECOMMENDED.md`

## 처음 사용할 때

1. 이 starter를 자신의 **Private** 저장소로 복제합니다.
2. `AGENTS.md`와 필요한 진입점을 읽고 현재 담당업무에 불필요한 스킬·프롬프트를 정리합니다.
3. 조직의 GitHub·외부 AI·개인정보 정책에 맞게 PC 환경별 동기화 규칙을 조정합니다.
4. Codex 스킬을 로컬에 설치할 경우 `tools/sync_codex_skills.ps1`을 먼저 `-DryRun`으로 확인합니다.
5. HWPX Kordoc runtime을 사용할 경우 `.github/workflows/hwpx-kordoc-check.yml`의 첫 성공 실행을 확인합니다.
6. 일상적인 사용 방법은 `QUICK_START.md`의 요청 예시부터 시작하면 됩니다.

## PC 환경별 동기화 방식

조직의 보안·네트워크 정책을 최우선으로 적용합니다. 아래 기준은 starter의 안전한 초기값이며, 실제 허용 범위가 다르면 새 저장소의 정본에 맞게 조정합니다.

| 환경 | 기본 방식 | 하지 않을 일 |
|---|---|---|
| 조직의 제한 PC | 현재 환경에서 승인된 GitHub 플러그인·MCP 등 허용된 경로로 원격 기준선을 확인하고 기능 브랜치·PR 방식으로 변경합니다. | 승인되지 않은 SSH·PAT·GCM 직접 로그인, 프록시·방화벽 우회, 민감자료의 임의 외부 전송 |
| Git 사용이 허용된 PC | 조직 정책이 허용하는 범위에서 일반 Git의 `fetch`·`pull`·기능 브랜치·PR 흐름을 사용합니다. | 사건자료·개인정보·인증정보·로컬 런타임을 Git 이력에 포함하는 작업 |

동기화 전에는 `.gitignore`만 믿지 말고 실제 변경 파일을 확인하여 사건자료, 개인정보, 내부 문서번호, 비공개 참조본, `.env`, API 키·토큰, OCR·변환 결과, 런타임·설치파일이 포함되지 않았는지 점검합니다. 이 starter를 복제한 뒤에는 새 저장소가 정본이며 원본 제공자의 `m1`과 자동 동기화하지 않습니다.

## 포함 범위

- `AGENTS.md`, `CHATGPT_ENTRYPOINT.md`, `GROK_ENTRYPOINT.md`
- `guides/`, `skills/`, `prompts/`
- 재사용 가능한 `tools/`의 소스·설명·설정
- 비식별 예시 및 템플릿
- HWPX Kordoc 검증 workflow
- 새 저장소에서 이후 채택 이력을 기록하기 위한 빈 `improvements/adoption_log.md`

## 포함하지 않는 것

- 실제 사건 원자료와 사건별 결과물
- API 키, 토큰, 쿠키, `.env` 실제 값
- OneOCR DLL·모델, HWPX 변환기 등 로컬 런타임·설치파일
- PDF 도구의 vendored Python 패키지 사본
- 개인 `LLM_Wiki/`, 기존 사용자의 개선 이력, 과거 백업과 비공유 보관자료
- 기존 Actions 실행 이력·artifact·cache·Secrets·Variables·Ruleset

`tools/PDF_READING_KIT`은 starter에서 소스와 설치정보만 제공하며 `vendor/`는 포함하지 않습니다. 필요한 Python 의존성은 해당 도구의 `requirements.txt`와 안내문을 기준으로 각 환경에서 설치합니다.

## 원본과의 관계

이 저장소를 복제한 이후에는 새 저장소가 각 사용자의 정본입니다. 원본 제공자의 규칙이나 이후 변경을 자동으로 따라갈 필요는 없으며, 자신의 업무에 맞는 하나의 정본 구조를 유지하는 것을 권장합니다.
