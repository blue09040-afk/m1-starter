# HWPX Kordoc Chat Runtime

## 목적

`skills/hwp-hwpx-processing/scripts/kordoc/`의 Node/Kordoc 실행환경을 일반 Chat 작업환경에서 재사용하기 위한 runtime artifact 정책이다.

실행 코드·테스트의 정본은 스킬 내부 `scripts/kordoc/`이고, 이 문서는 artifact 재사용·복구 절차만 관리한다.

## 기본 절차

1. `.github/hwpx-kordoc-runtime.json`을 읽어 현재 artifact 이름, source SHA, Kordoc 버전, 보존기간과 검증 상태를 확인한다.
2. `source_sha`는 **artifact를 실제 생성한 커밋**을 뜻한다. 현재 `main`의 저장소 HEAD와 단순 비교하지 말고, 해당 커밋 이후 `skills/hwp-hwpx-processing/scripts/kordoc/`의 실행 코드·직접 의존성·lockfile이 바뀌지 않았고 플랫폼·Kordoc 버전 조건이 같을 때 기존 artifact를 재사용할 수 있다.
3. 문서·manifest 또는 artifact 생성 내용에 영향을 주지 않는 workflow 트리거만 바뀐 경우에는 그것만으로 기존 artifact를 무효화하지 않는다. 반대로 `scripts/kordoc/` 실행 내용이 달라졌으면 기존 검증 플래그를 그대로 재사용하지 않는다.
4. artifact가 없거나 만료되었거나 현재 runtime 실행 내용과 맞지 않으면 `.github/workflows/hwpx-kordoc-check.yml`을 다시 실행해 새 runtime artifact를 만든다.
5. 현재 연결된 도구가 `workflow_dispatch` 실행을 지원하지 않으면 실행했다고 가장하지 말고 사용자가 GitHub Actions에서 **Run workflow**를 실행해야 함을 알린다.
6. artifact는 현재 작업환경에만 풀고 `KORDOC_OFFLINE=1`로 CLI를 실행한다.

## 안전 경계

- artifact에는 재사용 가능한 실행 코드와 의존성만 넣는다. 실제 업무 HWPX·Markdown·JSON·생성 결과를 포함하지 않는다.
- runtime 바이너리와 `node_modules`를 Git에 커밋하지 않는다.
- artifact 보존기간은 짧게 유지하고, 만료 후에는 현재 `main`에서 다시 생성한다.
- manifest의 검증 플래그가 false이면 검증 완료 상태로 간주하지 않는다. `source_sha`가 현재 HEAD와 다르다는 이유만으로 무효화하지 말고, 위 기본 절차에 따라 **runtime 실행 내용의 변경 여부**를 확인한다.
- artifact가 존재한다는 사실은 HWPX 결과의 화면 품질을 보증하지 않는다. 작성 결과의 시각 검증 조건은 `skills/hwp-hwpx-processing/references/HWPX_KORDOC_WRITING_RUNTIME.md`를 따른다.

## 갱신

Kordoc 또는 직접 의존성 변경 시 `package.json` exact pin과 `package-lock.json`을 함께 갱신하고 `npm ci`, 문법검사, 전체 테스트, audit, runtime artifact 생성을 통과시킨 뒤 manifest를 현재 성공한 main run 기준으로 갱신한다.
