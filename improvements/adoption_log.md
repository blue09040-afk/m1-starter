# 채택 이력

이 파일은 이 starter를 복제한 사용자가 공통 지침·스킬·프롬프트에 채택한 변경 이력을 기록하기 위한 정본입니다.

- starter 제공자의 기존 개선 이력 원문은 포함하지 않습니다.
- 사건 고유 정보와 공유 제외 대상은 기록하지 않습니다.
- 사용자가 공통 규칙으로 채택하거나 반영을 승인한 변경만 기록합니다.
- 기록 시 날짜, 변경 요약, 정본 파일 경로를 남깁니다.

## 2026-09-09 — m1 Kordoc 4.12 runtime과 공식 upstream 경계 반영

- 계기: 공식 starter의 HWPX Kordoc runtime이 4.9.2에 머문 반면 현재 `m1` 정본은 Kordoc 4.12.0과 확장된 작성·검증 runtime을 사용하고 있어 공개 배포본의 실행 코드·지침이 뒤처진 상태를 확인함.
- 반영 범위: `skills/hwp-hwpx-processing/scripts/kordoc/`의 reusable 실행 코드·테스트·직접 의존성, `skills/hwp-hwpx-processing/SKILL.md`, Kordoc runtime 정책·manifest, `guidance-sync`의 공식 upstream 예외, 본 이력.
- 동기화 기준: m1의 현재 reusable runtime 소스·테스트 13개를 blob SHA 단위로 동일하게 맞추고, starter의 package name·lockfile 미커밋·저장소별 artifact 생성 정책은 유지함.
- 문서 처리 기준: HWP/HWPX 일반 읽기는 실제 실행 가능한 검증된 Kordoc parse-only 경로가 있을 때 우선하고, 스캔·이미지·경고가 있는 영향 범위만 선택적으로 OCR함. 바이너리 HWP의 공식 HWPX 변환기는 Kordoc 불가·실패·불완전 의심·정확한 구조/편집 필요 시 fallback 또는 교차검증으로 유지함.
- upstream 경계: 원본 제공자가 관리하는 `blue09040-afk/m1-starter` 자체만 `blue09040-afk/m1`의 이미 병합된 공개·재사용 가능한 변경을 선택적 upstream으로 대조할 수 있으며, 템플릿 복제 저장소는 계속 독립 정본으로 운용함.
- 검증: HWPX Kordoc Check run `34282456109`에서 의존성 설치, Kordoc 4.12.0 exact pin, 문법검사, 전체 테스트, high 수준 npm audit, runtime bundle 생성·artifact 업로드가 성공함. artifact id `10078147077`, digest `sha256:ed4fa6aceef94faa41d13d0712e043fe81bd95ada1b63002a4fe28eab66fbfc9`.
- 한계: artifact ZIP 내부를 별도로 수동 대조하지 않아 `artifact_contents_verified`는 false로 유지하고, HWPX 최종 화면 품질은 실제 대상 뷰어 확인 경계를 그대로 적용함.

## 2026-09-08 — m1 공유 가능 업데이트 동기화

- 반영: 진정민원 2단계 절차·샘플·루트/Chat 라우팅, 권익위 4단계·2단계 구조 변형 샘플·SAMPLE_CATALOG·Chat 00/04, guidance-sync 스킬 분리와 루트/README 라우팅, 공익신고 사건 종료 이관, HWPX의 Kordoc 우선·선택적 OCR 및 PDF의 선택적 OCR 라우팅(starter 경량본), adaptive reasoning effort·선택적 Astra 자문 가이드.
- 제외: Windows 시작 동기화 도구, 로컬 OCR 런타임 등 환경 의존 구성, 원본 m1 README·채택이력 원문, starter 전용 STARTER_GUIDE/QUICK_START/PROJECT_INSTRUCTIONS.
- 정본 경로: skills/guidance-sync/, skills/petition-resolution-plan-workflow/, skills/acrc-grievance-complaint-workflow/, skills/public-interest-report-review/, guides/harness_structure_guide_v1_3.md, guides/chatgpt_sol_external_review_harness.md, skills/hwp-hwpx-processing/SKILL.md, skills/pdf-reading-kit/SKILL.md.
