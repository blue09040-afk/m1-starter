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
