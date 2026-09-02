# HWPX Kordoc 작성 런타임

## 목적

일반 Chat이나 실행 가능한 작업환경에서 실제 HWPX 분석·생성·편집·양식 채움·다중 문서 취합을 수행할 때 같은 스킬의 `scripts/kordoc/` 구현을 사용한다.

실행 코드의 정본은 `skills/hwp-hwpx-processing/scripts/kordoc/`이며, 현재 명령·의존성·테스트는 해당 디렉터리의 코드와 `README.md`를 우선한다. Chat용 runtime artifact의 현재 상태와 복구 절차는 저장소 루트 `.github/hwpx-kordoc-runtime.json`과 `.github/HWPX_KORDOC_RUNTIME.md`를 정본으로 사용한다.

## 적용 조건

다음 조건을 모두 만족할 때만 실제 파일 실행 경로를 사용한다.

1. 사용자가 HWPX 파일의 분석·생성·편집·양식 채움·취합 등 실제 파일 작업을 요청했다.
2. 현재 세션이 대상 파일을 실제로 읽고 결과 파일을 쓸 수 있다.
3. 현재 세션에서 Node 기반 Kordoc 런타임 또는 검증된 Chat runtime artifact를 실제로 실행할 수 있다.

저장소 문서를 읽을 수 있다는 사실만으로 파일 실행이 가능하다고 간주하지 않는다. 실행할 수 없으면 HWPX를 생성·수정했다고 표현하지 말고 가능한 텍스트·Markdown 작업까지만 수행한다.

## 기본 경로

가능하면 먼저 `node src/cli.mjs analyze <input.hwpx>` 결과로 안전한 작성 경로를 판단한다.

- 명시적 `{{placeholder}}`가 있으면 `template`
- HWPX 네이티브 `CLICK_HERE`가 있으면 `fill`
- 둘이 함께 있으면 `template-then-fill`
- 명시적 필드가 없으면 `patch-or-write`
- 반복 사용할 일반 HWPX에서 고유한 기존 문구를 안전하게 특정할 수 있으면 휴리스틱 label fill보다 `prepare-template`을 우선 검토한다.

CLI의 현재 인자와 동작은 `scripts/kordoc/src/cli.mjs --help`와 현재 코드가 정본이다. 기억한 명령을 현재 코드보다 우선하지 않는다.

## 위험 경로

- 표 라벨 기반 휴리스틱 fill은 자동 사용하지 않는다. 사용자가 의도적으로 허용하고 결과를 실제 대상 뷰어에서 확인할 수 있을 때만 `--allow-label-fill`을 사용한다.
- Kordoc 기본 patch가 지원하지 않는 경우의 제한적 text fallback도 자동 사용하지 않는다. 현재 코드의 제한 조건을 만족하고 사용자가 명시적으로 허용한 경우에만 `--allow-text-fallback`을 사용한다.
- `visualReviewRequired: true` 결과는 구조검증이나 SVG render만으로 최종 통과라고 판단하지 않는다.
- 수식·도형·복잡 표·페이지 흐름이 중요한 문서는 자동 구조검증과 별도로 한글/한컴독스 등 실제 제출 대상 뷰어에서 확인한다.
- 실제 화면을 확인하지 않았다면 화면 품질까지 검증했다고 표현하지 않는다.

## 다중 문서

`collect`는 여러 HWPX/Markdown을 출처 표시가 있는 중간 Markdown으로 모으는 단계다. 의미 선택·요약·재작성은 Chat/LLM 단계에서 수행하며 원문에 없는 사실을 보충하지 않는다.

## 데이터 경계

실제 업무 HWPX, 추출 Markdown, 채움 데이터, 생성 결과는 현재 작업환경에만 둔다. 재사용 스킬 저장소에는 실제 사건자료·개인정보·업무 fixture나 생성 결과를 커밋하지 않는다.

## runtime 복구

현재 실행환경에 필요한 `node_modules`가 없거나 npm registry를 사용할 수 없으면 임의 설치·우회 절차를 만들지 않는다.

1. `.github/hwpx-kordoc-runtime.json`에서 현재 artifact 이름·Kordoc 버전·검증 상태를 확인한다.
2. `.github/HWPX_KORDOC_RUNTIME.md`의 재사용·재생성 절차를 따른다.
3. 검증된 artifact를 작업환경에 풀어 실행할 때도 실제 업무파일은 artifact나 저장소에 넣지 않는다.
4. runtime 바이너리와 `node_modules`는 Git에 커밋하지 않는다.
