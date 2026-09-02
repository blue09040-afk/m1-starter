# Grok 진입점

## 1. 지위

이 파일은 **Grok 일반 Chat**에서 `m1` 지침을 쓸 때의 경량 진입점이다.

Grok 일반 Chat은 **기본 검토 경로가 아니다.** ChatGPT 토큰 소진 또는 세션 불가 후의 폴백, 또는 사용자가 Grok을 제3자 검토자로 명시한 경우에만 적용한다. 아직 적극 운용 대상이 아니라 시험 관찰 경로로 둔다.

- Codex 자동 실행 진입점은 계속 `AGENTS.md`다.
- 일반 ChatGPT 진입점은 계속 `CHATGPT_ENTRYPOINT.md`다.
- Codex·ChatGPT의 기본 외부 독립검토는 계속 `guides/chatgpt_sol_external_review_harness.md`와 ChatGPT 경로다.
- **OpenCodex를 통해 Codex·Grok Build 등에서 xAI/Grok 구독 모델을 쓰는 경로는 이 파일이 아니라 `AGENTS.md`와 `guides/opencodex_grok_runtime.md`를 적용한다.** 모델이 Grok이라는 이유만으로 Codex 실행환경을 Grok 일반 Chat으로 바꾸지 않는다.
- 이 파일은 위 정본과 `guides/BASE_INSTRUCTIONS.md`, `skills/`, `prompts/`를 대체하지 않는다.
- 새 행정 판단규칙을 여기서 만들지 않는다. 필요한 정본 경로와 Grok 일반 Chat 실행환경 경계만 연결한다.

## 2. 적용 게이트

이 파일은 **Grok 일반 Chat 세션**에서만 적용한다. OpenCodex-routed Codex/Grok Build나 일반 Codex·ChatGPT가 `제3자 검토`라는 표현만 보고 이 경로로 바꾸지 않는다.

다음 중 하나를 만족할 때만 적용한다.

1. **폴백**: 사용자가 ChatGPT 토큰 소진, 사용량 한도, 세션 중단, GitHub 연결 불가 등으로 ChatGPT 경로를 쓸 수 없다고 밝혔거나 그 사정이 명확하다.
2. **명시적 Grok 제3자 검토**: 사용자가 `Grok`, `그록`을 검토 주체로 지정하거나, 이미 Grok 일반 Chat 세션에서 `제3자 검토`, `Grok으로 독립검토`를 요청한다.

다음에는 적용하지 않는다.

- 일반 신규 검토, Codex 기본 작업, ChatGPT가 사용 가능한 독립검토
- OpenCodex를 통해 Codex 클라이언트 안에서 `xai/grok-*`를 사용하는 작업
- Codex가 품질 향상을 이유로 Grok을 자동 제안·호출하는 경우
- `제3자 관점`, `처음 보는 입장`만 있고 Grok 경로 지정이 없는 경우. 이는 기존 ChatGPT 독립검토 또는 `iterative-review` 트리거로 본다.
- 적용 여부가 모호하면 ChatGPT/Codex 기존 경로를 유지하고 Grok 일반 Chat으로 바꾸지 않는다.

결과의 지위는 `시험 관찰`이다. 자동 채택·기본 검토 대체·공통 지침 즉시 승격 대상이 아니다. 반복 교훈은 사용자 승인 후에만 `improvements/` 후보로 남긴다.

## 3. 이 경로에서 Grok이 할 수 있는 일

현재 기준은 **GitHub이 연결된 Grok 일반 Chat**이다. 이 환경에는 Codex의 Luna·Terra·Sol 모델분할, `spawn_agent`, 사무실 로컬 PowerShell·한컴 COM·OneOCR가 없다. 필요하면 도구를 병렬로 호출할 수 있으나, 하위 작업을 다른 등급 모델에 위임하는 하네스는 적용하지 않는다. GitHub 커넥터의 쓰기 도구·권한은 현재 세션에서 실제 제공 여부를 확인하며 기본 전제로 두지 않는다.

- 가능: 지정된 GitHub 지침·텍스트 추출본 읽기, `review`의 지정 사건 `extracted/` 읽기, 공식 법령·웹 확인
- 조건부 가능: 결과 Markdown을 GitHub에 저장. 현재 세션에 실제 쓰기 도구가 있고 대상 저장소 쓰기 권한이 확인된 경우에만 수행한다.
- 기본 전제 아님: 사무실 PC 로컬 Git 접속, HWP COM, OneOCR, Codex 스킬 동기화, Luna/Terra 서브에이전트. GitHub 커넥터만으로 HWPX·PDF 원본의 안정적 화면 판독도 보장하지 않는다.
- 현재 대화에 사용자가 직접 첨부한 PDF 등은 세션이 실제로 판독할 수 있으면 사용할 수 있으나, 판독 성공 여부를 확인하지 않고 원본을 읽었다고 쓰지 않는다.
- Grok Build CLI와 OpenCodex는 이 **일반 Chat 경로의 전제가 아니다.** 해당 실행환경이면 `guides/opencodex_grok_runtime.md`로 분기한다.

## 4. 사건 독립검토 기본 동작

아래는 사용자가 지정 사건의 독립검토를 요청했을 때의 기본값이다. 지침 수정, 반복 재검토, 권익위·공익신고·진정민원 등 다른 업무는 5절 라우팅을 따른다.

1. 사건 고유자료는 `m1`에서 찾지 않는다. 현재 대화 첨부·붙여넣기와 사용자가 명시한 `review` 사건 폴더만 본다.
2. 1차에는 지정 사건의 `extracted/` 텍스트·마스킹본을 우선 읽는다. `source/` 파일은 목록을 확인하고, 텍스트로 안정적으로 읽히는 파일만 엽다. HWPX·PDF 등 화면 판독이 필요한 원본은 실제 판독 성공을 확인하지 못했으면 읽었다고 쓰지 않는다.
3. 경로·파일명에 `CODEX_REVIEW`, `SOL_EXTERNAL_REVIEW`, `HANDOFF`, `result/`가 있으면 **목록만 확인하고 본문은 열지 않는다.**
4. 1차에는 저장소 전체를 검색해 Codex·ChatGPT 산출물을 찾지 않는다. 같은 대화에 그 결론이 이미 노출되었으면 `준블라인드 검토`로 표시하고, 그래도 원자료 근거를 먼저 만든다.
5. 행정 판단 기준이 필요할 때만 `guides/BASE_INSTRUCTIONS.md`의 관련 절을 본다. 파일 탐색·로컬 실행·서브에이전트·HANDOFF·LLM Wiki 등 Codex 운영 절차는 가져오지 않는다.
6. 독립검토 절차는 `prompts/chat_mode/독립검토/`를 재사용한다. 1차는 `01_민원_블라인드_독립검토.md`, 운용원칙은 `00_독립검토_운용원칙.md`다. 이 Grok 경로에서는 두 문서의 `Sol`·`ChatGPT` 표기를 Grok에 맞게 읽고, `현재 대화에 사건 원자료가 첨부·붙여넣기 되어 있음`이라는 조건은 **사용자가 이 진입점에 따라 명시적으로 지정한 `review` 사건 폴더의 허용된 `extracted/`·마스킹본을 현재 세션에서 실제 읽은 경우에도 충족한 것으로 본다.** 이는 사건자료의 저장소 전체 탐색을 허용한다는 뜻이 아니며, 1차 블라인드의 검색 금지·결과물 미열람·원자료 우선 원칙은 그대로 유지한다. 그 밖의 실행환경 차이는 이 진입점이 우선하고, 행정 판단 기준 자체는 기존 정본을 바꾸지 않는다.
7. 결과 형식은 `prompts/chat_mode/독립검토/templates/SOL_EXTERNAL_REVIEW_TEMPLATE.md`의 **구조와 항목 의미**를 재사용한다. Grok 결과에서는 실행환경 표기만 바꾸어 `CHATGPT_ENTRYPOINT.md`는 `GROK_ENTRYPOINT.md`로, 본문·표의 `Sol`·`ChatGPT` 검토자 표기는 `Grok`으로 기록한다. `S1`, `S2` 같은 쟁점 ID와 단계 구조는 Codex·ChatGPT 결과와 대조할 수 있도록 유지한다. GitHub 쓰기 도구와 대상 저장소 권한이 실제 확인된 경우 저장 파일명은 `result/GROK_REVIEW.md`로 한다. 같은 이름의 기존 결과가 있으면 **최신 검토결과로 갱신하는 것이 기본 동작**이며, Git 커밋 이력으로 이전 버전을 복구할 수 있으므로 별도 파일을 만들지 않는다. 헤더에는 `경로: 폴백` 또는 `경로: 명시적 제3자 검토`, `지위: 시험 관찰`을 남긴다.
8. GitHub 쓰기 도구가 없거나 권한이 확인되지 않았거나 쓰기가 실패하면 성공했다고 표현하지 않고 결과 전문을 대화에 반환한다. 쓰기를 위해 우회 인증이나 임의 저장소 변경을 하지 않는다.
9. 추출본과 원본이 충돌하거나 표·글상자·중요 수치가 비면 `원본 확인 필요`로 두고 Codex에 넘긴다. 읽지 못한 파일을 읽었다고 쓰지 않는다.
10. 개인정보·민감정보는 이미 마스킹된 추출본과 사용자가 지정한 범위만 사용한다. 신규 원문 업로드, 식별정보를 검색어에 넣는 행위, 외부 OCR 전송은 하지 않는다.

2차 교차검증과 3차 레드팀은 사용자가 명시하거나, 1차 결과와 기존 Codex·ChatGPT 결론을 대조하라고 요청한 뒤에만 연다. 그때는 `02_Codex결과_교차검증.md`, `03_최종회신문_레드팀검토.md`를 적용한다. 같은 방식으로 실행환경 표기만 Grok에 맞게 바꾸고 1차 스냅샷·쟁점 ID는 보존한다. GitHub 쓰기가 실제 가능한 경우 결과는 각각 `result/GROK_CROSS_REVIEW.md`, `result/GROK_REDTEAM_REVIEW.md`로 두며, 같은 이름의 기존 결과가 있으면 최신 결과로 갱신한다. 쓰기가 불가능하면 결과 전문을 대화에 반환한다.

## 5. 요청별 라우팅

행정 판단 업무가 정해지면 기존 Chat 경로를 그대로 따른다. 정본을 여기 복제하지 않는다. 아래에 없는 업무는 `CHATGPT_ENTRYPOINT.md`의 요청별 라우팅을 따른다.

- 권익위 고충민원: `prompts/chat_mode/권익위 수행 검토/`
- 진정민원 1단계: `prompts/chat_mode/진정민원 수행 검토/`
- 공익신고: `prompts/chat_mode/공익신고 검토/`와 `skills/public-interest-report-review/`
- 굵은 수정안: `prompts/chat_mode/굵은_수정안_검토_지침.md`
- 반복 재검토: `prompts/chat_mode/반복_재검토_지침.md`
- 내용 검증: `skills/document-validation-pipeline/SKILL.md`의 내용 검증만. `_validation/` 파일 작업은 실제 가능할 때만
- HWP/HWPX 실행: 이 세션이 대상 파일과 Node 런타임을 실제로 실행할 수 있을 때만 `skills/hwp-hwpx-processing/SKILL.md`. 그렇지 않으면 텍스트·Markdown까지만 하고 실행했다고 쓰지 않는다

## 6. 하네스

기본 검토에는 `guides/grok_work_harness.md`를 읽지 않는다.

다음일 때만 연다.

- 지정 사건 추출본이 많거나 폴더가 여러 단계다
- 법령·권한·시점이 결론을 가른다
- 사용자가 `하네스`, `나눠서`, `목록 대사`를 말한다

하네스는 모델분할 지침이 아니다. 도구 호출 범위, GitHub 목록 오염 방지, 완전성 대사, Codex로 되돌릴 조건만 다룬다.

## 7. Codex·ChatGPT로 되돌리는 조건

Grok 일반 Chat은 다음이면 추정으로 메우지 않고 경로를 되돌린다.

- ChatGPT를 다시 쓸 수 있게 되었다
- 사용자가 OpenCodex xAI/Grok 경로로 이어서 작업하기로 했다
- HWPX/PDF 원본 화면이 결론을 바꾸는데 추출본이 비거나 깨졌고, 현재 Grok 세션에서도 원본을 안정적으로 판독할 수 없다
- 빠른 HWPX 작성, 로컬 OCR, 사무실 파일 수정이 필요하다
- 개인정보 원문 처리가 필요하고 마스킹본만으로는 판단할 수 없다

## 8. 최소 호출

적용 게이트를 이미 통과했다면 사용자는 사건 지정만 하면 된다.

```text
@GitHub m1의 GROK_ENTRYPOINT.md를 적용해.
review의 <사건폴더>를 대상으로 해.
ChatGPT는 토큰이 소진됐어.          ← 폴백인 경우
제3자 검토로 Grok 독립검토해줘.  ← 명시 요청인 경우
```

단계·결과 형식·1차 금지 파일은 이 파일이 기본값으로 적용한다. 저장은 현재 Grok 세션에서 GitHub 쓰기 도구와 권한이 실제 확인된 경우에만 기본 경로를 사용하며, 같은 결과 파일이 이미 있으면 최신 결과로 갱신한다. 사용자가 저장 위치나 단계를 따로 정하면 그 지시를 우선한다.

## 9. 정본 변경 금지

반복 가능한 새 행정 규칙이 필요하면 `skills/guidance-repo-maintenance/`의 중복 방지 원칙에 따라 기존 정본을 고칠지 별도로 검토한다. 시험 중 발견한 점은 사건 산출물 또는 `improvements/` 후보에만 남긴다.