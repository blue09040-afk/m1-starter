# HWPX Kordoc Chat Runtime — starter

## 목적

`skills/hwp-hwpx-processing/scripts/kordoc/`의 Node/Kordoc 실행환경을 일반 Chat 작업환경에서 재사용하기 위한 **starter용 runtime artifact 정책**이다.

실행 코드·테스트의 정본은 스킬 내부 `scripts/kordoc/`이고, 이 문서는 starter 자체의 검증 이력과 템플릿으로 복제한 새 저장소의 첫 runtime 생성 절차를 설명한다.

## starter와 복제 저장소의 경계

- `.github/hwpx-kordoc-runtime.json`에 기록된 `template_source_verification`은 **이 starter 저장소 자체에서 workflow가 정상 동작했다는 검증 기록**이다.
- GitHub Actions artifact와 run ID는 저장소별 자원이다. `Use this template`로 만든 새 저장소에서는 starter의 `artifact_id`나 `workflow_run_id`를 자신의 artifact처럼 재사용하지 않는다.
- 새 저장소에서는 `HWPX Kordoc Check`를 한 번 실행하여 **자기 저장소의 runtime artifact**를 생성한다.
- artifact 이름은 동일하게 `m1-starter-hwpx-kordoc-chat-linux-x64`를 사용할 수 있지만, 실제 artifact ID와 run ID는 각 저장소에서 새로 만들어진다.

## starter의 의존성 방식

starter는 대형 `package-lock.json`과 `node_modules`를 Git에 포함하지 않는다.

1. `package.json`의 직접 의존성은 exact pin한다.
2. `.github/workflows/hwpx-kordoc-check.yml`은 첫 실행에서 `npm install --omit=optional --ignore-scripts --no-audit --no-fund`로 의존성을 설치하고 lockfile을 생성한다.
3. exact Kordoc 버전 확인, 문법검사, 테스트, `npm audit --audit-level=high`를 통과한 뒤 runtime artifact를 만든다.
4. 생성된 artifact에는 `package.json`, **그 실행에서 생성된 `package-lock.json`**, `src/`, `node_modules`, `README.md`, `OFFLINE.md`를 포함한다.
5. 생성된 lockfile과 `node_modules`는 runtime artifact 안에서만 사용하고 Git 저장소에는 커밋하지 않는다.

## 복제 후 기본 절차

1. 새 저장소의 Actions에서 `HWPX Kordoc Check`를 실행한다.
2. workflow가 성공하고 `m1-starter-hwpx-kordoc-chat-linux-x64` artifact가 생성됐는지 확인한다.
3. 현재 작업환경에서 artifact를 사용할 때는 **현재 저장소에서 생성된 최신 성공 artifact**를 사용한다.
4. artifact가 없거나 만료되었거나 `scripts/kordoc/` 실행 코드 또는 직접 의존성이 바뀌었으면 workflow를 다시 실행한다.
5. 현재 연결된 도구가 `workflow_dispatch` 실행을 지원하지 않으면 실행했다고 가장하지 말고 사용자가 GitHub Actions에서 **Run workflow**를 실행해야 함을 알린다.
6. artifact는 현재 작업환경에만 풀고 `KORDOC_OFFLINE=1`로 CLI를 실행한다.

## 안전 경계

- artifact에는 재사용 가능한 실행 코드와 의존성만 넣는다. 실제 업무 HWPX·Markdown·JSON·생성 결과를 포함하지 않는다.
- runtime 바이너리와 `node_modules`, 실제 `.env`를 Git에 커밋하지 않는다.
- artifact 보존기간은 짧게 유지하고, 만료 후에는 현재 저장소에서 다시 생성한다.
- starter의 검증 이력은 새 저장소의 runtime 생성 성공을 대신하지 않는다.
- artifact가 존재한다는 사실은 HWPX 결과의 화면 품질을 보증하지 않는다. 작성 결과의 시각 검증 조건은 `skills/hwp-hwpx-processing/references/HWPX_KORDOC_WRITING_RUNTIME.md`를 따른다.

## 변경 시 검증

Kordoc 또는 직접 의존성, `scripts/kordoc/` 실행 코드, runtime workflow를 변경하면 `HWPX Kordoc Check`를 다시 실행한다. 성공 여부와 artifact 생성까지 확인하되, 새 저장소에서 사용하는 artifact는 항상 그 저장소의 Actions 실행으로 생성한다.
