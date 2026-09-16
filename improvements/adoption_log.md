# 채택 이력

이 파일은 이 starter를 복제한 사용자가 공통 지침·스킬·프롬프트에 채택한 변경 이력을 기록하기 위한 정본입니다.

- starter 제공자의 기존 개선 이력 원문은 포함하지 않습니다.
- 사건 고유 정보와 공유 제외 대상은 기록하지 않습니다.
- 사용자가 공통 규칙으로 채택하거나 반영을 승인한 변경만 기록합니다.
- 기록 시 날짜, 변경 요약, 정본 파일 경로를 남깁니다.

## 2026-09-16 — 행정 자료검색·Kordoc 읽기·OpenCodex 권한 경계 동기화

- 계기: 원본 정본의 2026-09-16 병합 변경 중 공개·재사용 가능한 PR #42~#44가 starter에 아직 반영되지 않은 상태를 확인함.
- 반영 범위: `AGENTS.md`, `CHATGPT_ENTRYPOINT.md`, `GROK_ENTRYPOINT.md`, `skills/admin-source-lookup/`, `skills/admin-document-base-review/SKILL.md`, `skills/pdf-reading-kit/`, `skills/hwp-hwpx-processing/`, `guides/harness_structure_guide_v1_3.md`, `guides/opencodex_grok_runtime.md`, 본 이력.
- 자료검색: 법령·조례·고시·담당부서·필지·웹 PDF는 전용 공식 경로를 먼저 사용하고, 공식 URL을 모를 때만 Web을 발견용으로 최소 사용한다. Firecrawl은 웹 PDF의 기본 판독 경로로 사용하지 않으며 도구 선택·fallback은 필요할 때만 upstream `coding/guides/WEB_SEARCH.md`를 참조한다.
- HWP/HWPX: Windows에서는 전역 PATH의 `kordoc` 유무와 실제 runtime 가용성을 구분하고, `invoke_kordoc_reading.cmd`로 고정 runtime을 먼저 확인한다. 단순 command-not-found만으로 PATH 변경·패키지 설치·HWP COM/OLE 전환을 요청하지 않는다.
- OpenCodex: 과거 Gemini 전용 외부 패킷 워커의 비활성 상태와 현재 OpenCodex runtime을 분리하고, Gemini·Grok 등 routed 모델의 사용 가능 여부는 현재 roster·surface·도구 가용성과 공급자·자료 경계로 판단한다. 모델 전환은 파일·셸·GitHub 권한을 확대하지 않는다.
- starter 경계: 로컬 runtime payload·사건자료·개인 설정은 추가하지 않고, starter 전용 독립 운영 원칙을 유지한다.

## 2026-09-15 — private GitHub PDF 원본 확인 경로 채택

- 계기: GitHub 사건폴더에 PDF와 추출 Markdown이 함께 있을 때 일반 Chat이 추출본만으로 판단하거나, generic UTF-8 fetch 실패를 PDF 자체의 접근 불가로 오인할 수 있음을 실제 도구 검증에서 확인함.
- 반영 범위: `CHATGPT_ENTRYPOINT.md`, `skills/pdf-reading-kit/SKILL.md`, `skills/pdf-reading-kit/references/GITHUB_PDF_SOURCE_HANDOFF.md`, `skills/document-validation-pipeline/SKILL.md`, `skills/guidance-sync/references/repository_sync_workflow.md`, `AGENTS.md`, 본 이력.
- 정본: PDF 원본 획득·판독 절차는 `pdf-reading-kit`에 두고, Chat 진입점과 문서 검증 스킬에는 추출본이 결론에 충분하지 않을 때 원본 PDF로 재확인하는 트리거만 둠.
- 핵심 변경: private GitHub PDF는 연결된 GitHub MCP가 지원하는 경우 `fetch_file(..., encoding="base64")`로 원본 내용을 Base64로 획득하고, 지원되는 환경에서 디코딩해 PDF 헤더·바이트 수·가능한 Git blob SHA를 검증한 뒤 로컬 PDF 판독으로 연결함. generic `fetch`의 UTF-8 제한과 PDF 원본 접근 실패를 구분하도록 함.
- 적용 기준: 기존 `extracted/*.md`는 빠른 1차 판독에 우선 사용할 수 있으나 표·레이아웃·이미지·직인·서명·페이지 경계·누락 또는 정확한 날짜·수치 등이 결론에 영향을 주고 추출본만으로 애매하면 PDF 원문을 확인함. 매 사건마다 기계적으로 전체 PDF를 재판독하지 않음.
- 보안 경계: Base64 payload와 원본 바이트를 답변·로그·공유 지침에 노출하지 않고, GitHub 커넥터 인증이 다른 Web·Acrobat·OCR 도구에 공유된다고 가정하지 않음. 비공개 사건자료의 외부 OCR·변환은 기존 승인 규칙을 유지함.

## 2026-09-09 — Kordoc 4.12 runtime과 공식 upstream 경계 반영

- 계기: 공식 starter의 HWPX Kordoc runtime이 4.9.2에 머문 반면 현재 정본은 Kordoc 4.12.0과 확장된 작성·검증 runtime을 사용하고 있어 공개 배포본의 실행 코드·지침이 뒤처진 상태를 확인함.
- 반영 범위: `skills/hwp-hwpx-processing/scripts/kordoc/`의 reusable 실행 코드·테스트·직접 의존성, `skills/hwp-hwpx-processing/SKILL.md`, Kordoc runtime 정책·manifest, `guidance-sync`의 공식 upstream 예외, 본 이력.
- 동기화 기준: 정본의 현재 reusable runtime 소스·테스트 13개를 blob SHA 단위로 동일하게 맞추고, starter의 package name·lockfile 미커밋·저장소별 artifact 생성 정책은 유지함.
- 문서 처리 기준: HWP/HWPX 일반 읽기는 실제 실행 가능한 검증된 Kordoc parse-only 경로가 있을 때 우선하고, 스캔·이미지·경고가 있는 영향 범위만 선택적으로 OCR함. 바이너리 HWP의 공식 HWPX 변환기는 Kordoc 불가·실패·불완전 의심·정확한 구조/편집 필요 시 fallback 또는 교차검증으로 유지함.
- upstream 경계: 원본 제공자가 관리하는 공식 starter 자체만 원본 정본 저장소의 이미 병합된 공개·재사용 가능한 변경을 선택적 upstream으로 대조할 수 있으며, 템플릿 복제 저장소는 계속 독립 정본으로 운용함.
- 검증: HWPX Kordoc Check에서 의존성 설치, Kordoc 4.12.0 exact pin, 문법검사, 전체 테스트, high 수준 npm audit, runtime bundle 생성·artifact 업로드가 성공함.
- 한계: artifact ZIP 내부를 별도로 수동 대조하지 않아 `artifact_contents_verified`는 false로 유지하고, HWPX 최종 화면 품질은 실제 대상 뷰어 확인 경계를 그대로 적용함.

## 2026-09-08 — 공유 가능 업데이트 동기화

- 반영: 진정민원 2단계 절차·샘플·루트/Chat 라우팅, 권익위 4단계·2단계 구조 변형 샘플·SAMPLE_CATALOG·Chat 00/04, guidance-sync 스킬 분리와 루트/README 라우팅, 공익신고 사건 종료 이관, HWPX의 Kordoc 우선·선택적 OCR 및 PDF의 선택적 OCR 라우팅(starter 경량본), adaptive reasoning effort·선택적 Astra 자문 가이드.
- 제외: Windows 시작 동기화 도구, 로컬 OCR 런타임 등 환경 의존 구성, 원본 README·채택이력 원문, starter 전용 STARTER_GUIDE/QUICK_START/PROJECT_INSTRUCTIONS.
- 정본 경로: skills/guidance-sync/, skills/petition-resolution-plan-workflow/, skills/acrc-grievance-complaint-workflow/, skills/public-interest-report-review/, guides/harness_structure_guide_v1_3.md, guides/chatgpt_sol_external_review_harness.md, skills/hwp-hwpx-processing/SKILL.md, skills/pdf-reading-kit/SKILL.md.
