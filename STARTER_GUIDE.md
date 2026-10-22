# m1-starter 사용 안내

이 저장소는 다른 직원이 실제 업무에서 사용한 `m1` 지침·프롬프트·스킬 구조를 출발점으로 제공하는 **독립 복제용 시작본**입니다.

## 운영 원칙

- 원본 사용자의 업무규칙을 팀 공통표준으로 강제하지 않습니다.
- 복제한 뒤에는 새 저장소가 자신의 정본입니다.
- 자신의 담당업무·조직 정책·PC 환경·사용 모델에 맞게 자유롭게 수정·삭제·추가합니다.
- 원본 `m1`과 자동 동기화하지 않습니다. 필요한 개선만 선택적으로 가져옵니다.

## 공유 전 소유자 점검

직원에게 배포할 때는 GitHub 저장소 설정에서 **Template Repository**로 활성화한 뒤 `Use this template`로 각자의 새 저장소를 만들게 하는 방식을 권장합니다. 템플릿으로 만든 저장소는 starter와 별도의 프로젝트·이력으로 시작하므로 독립 운영 목적에 맞습니다.

Template Repository를 사용하지 않는 경우에도 공유받은 starter 자체를 개인 작업공간으로 계속 수정하지 말고, 먼저 자신의 새 Private 저장소를 만든 뒤 기본 브랜치의 파일을 옮겨 독립 정본으로 운영합니다. 조직 정책상 허용되지 않은 Git 인증·전송 방식을 새로 만들지는 않습니다.

## 복제 후 시작점

- Codex: `AGENTS.md`
- 일반 ChatGPT: `CHATGPT_ENTRYPOINT.md`
- Grok 일반 Chat 폴백: `GROK_ENTRYPOINT.md`
- 공통 행정문서 기준: `guides/BASE_INSTRUCTIONS.md`
- 업무별 실행 절차: `skills/`
- 반복 작업 입력문: `prompts/`
- 로컬 보조도구: `tools/`
- 자주 쓰는 업무 요청 예시: `QUICK_START.md`
- ChatGPT 프로젝트 상위 지침 권장안: `PROJECT_INSTRUCTIONS_RECOMMENDED.md`

## 처음 할 일

1. 이 저장소가 GitHub Template Repository로 설정되어 있으면 `Use this template`로 자신의 Private 저장소를 만듭니다.
2. `README.md`와 자신의 사용 모델에 맞는 진입점을 읽습니다.
3. 필요 없는 기관·업무 특화 스킬과 프롬프트를 제거하거나 자신의 환경에 맞게 바꿉니다.
4. Codex 스킬을 로컬에 설치할 경우 `tools/sync_codex_skills.ps1 -DryRun`으로 먼저 확인합니다.
5. HWPX Kordoc 기능을 사용할 경우 `HWPX Kordoc Check`의 성공 여부를 확인합니다.
6. PDF 도구는 `tools/PDF_READING_KIT/README.md`에 따라 각 PC에서 Python 의존성을 설치합니다.
7. 초기 설정이 끝나면 `QUICK_START.md`의 요청 예시로 실제 업무를 시작합니다.
8. ChatGPT 프로젝트를 별도로 만들 경우 `PROJECT_INSTRUCTIONS_RECOMMENDED.md`를 상위 프로젝트 지침의 출발점으로 사용합니다.

## 복사되지 않는 것

새 저장소에는 다음 GitHub 웹 상태가 자동 복사되지 않습니다.

- Actions 실행 이력과 cache/artifact
- Repository/Environment Secrets 및 Variables
- Ruleset / branch protection
- Collaborator 권한
- GitHub App 연결 상태

또한 이 starter에는 실제 사건자료, 실제 `.env`, API 키·토큰, OneOCR DLL·모델, `node_modules`, PDF `vendor/`와 같은 로컬 runtime을 넣지 않습니다.

## 처음 ChatGPT에 요청할 문구

```text
내 m1 저장소는 다른 직원의 실사용 지침 구조를 출발점으로 복사한 거야.
기존 직원의 규칙을 팀 공통표준으로 강제하지 말고,
현재 파일과 구조를 먼저 확인한 다음 내가 하는 업무와 환경에 맞게
필요한 부분만 수정해서 독립적으로 운영할 수 있도록 도와줘.
```

## review와 함께 사용할 때

`review-starter`도 자신의 Private 저장소로 별도 복제해 사건자료·작업자료와 공통지침을 분리하는 것을 권장합니다. `review`의 자동 문서추출과 OneOCR 검증은 해당 저장소의 Actions에서 독립적으로 동작합니다.

## 개인 Private 저장소 처음 만들기 (`m1`·`review` 기본, `memory` 선택)

문안을 반복 수정하면서 확인된 **비민감 작성 선호와 재사용 가능한 처리 패턴**을 별도 저장소에 보관하고 싶다면, 공개 [memory-starter](https://github.com/blue09040-afk/memory-starter)를 사용합니다. memory를 만들지 않아도 `m1`·`review`의 기본 업무는 정상적으로 할 수 있습니다.

GitHub를 처음 사용하고 해당 저장소를 아직 만들지 않았다면 다음을 **웹 화면에서 한 번씩** 진행합니다. 이미 만든 개인 저장소는 중복 생성하지 않습니다.

1. [m1-starter](https://github.com/blue09040-afk/m1-starter)를 열고 **Use this template → Create a new repository**를 선택합니다. Owner는 내 GitHub 계정, 이름은 `m1`, Visibility는 **Private**로 정한 뒤 생성합니다.
2. [review-starter](https://github.com/blue09040-afk/review-starter)에서도 같은 순서로 **내 계정의 Private `review`**를 생성합니다. 기관에서 사건자료를 외부 GitHub에 보관할 수 있는지 먼저 확인합니다.
3. 장기 기억을 쓰려면 [memory-starter](https://github.com/blue09040-afk/memory-starter)에서도 같은 순서로 **내 계정의 Private `memory`**를 생성합니다. 이 공개 starter 자체에 실제 기억을 적지 않습니다.
4. ChatGPT의 연결된 GitHub 접근 권한에 **내 `m1`·`review` 저장소(그리고 만들었다면 `memory`)**가 포함되어 있는지 확인합니다. GitHub 계정이 다르거나 Private 저장소가 보이지 않으면 접근 권한을 확인하되, 토큰 추출·우회 연결은 시도하지 않습니다.
5. ChatGPT에 **내 `m1` 저장소**의 `CHATGPT_ENTRYPOINT.md`와 `skills/document-revision-memory/SKILL.md`를 확인해 달라고 요청합니다. AI가 현재 인증된 GitHub 계정과 **내 `memory` 저장소의 소유자가 동일**하고 Private인지 검증한 경우에만 **내 `memory` 저장소 안의** `README.md` → `MEMORY.md` → `m1/MEMORY.md` 순서로 필요한 내용을 읽도록 요청합니다.

기억을 저장할 때는 사건 원문·실명·개인정보·내부 문서번호·비밀정보를 제외합니다. memory는 현재 사건 증거·법령·지침을 대체하지 않으며, 기존 파일 저장은 최신 버전을 확인하는 **조건부 갱신**만 허용합니다.

처음 연결 확인용 요청 예시:

```text
@GitHub에서 내가 소유한 Private m1, review, memory 저장소를 확인해줘.
내 m1의 CHATGPT_ENTRYPOINT.md와 document-revision-memory를 읽고,
내 memory의 README.md, MEMORY.md, m1/MEMORY.md를 필요한 범위에서 확인해줘.
타인 소유 memory에는 접근하지 말고, 내 memory가 없거나 읽기 권한이 없으면
일반 m1·review 업무만 진행해줘. 읽기 또는 저장 성공을 추정해서 말하지 마.
```
