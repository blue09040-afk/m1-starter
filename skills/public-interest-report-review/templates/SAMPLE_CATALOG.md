# 공익신고 비식별 샘플 카탈로그

이 파일은 Chat과 Codex가 현재 공익신고 업무에 맞는 비식별 Markdown 예시를 선택하기 위한 라우팅 표이다. 사건 사실과 법적 판단은 현재 대화의 원자료 및 확인한 공식 근거에서만 가져온다.

## 현재 등재 샘플

| 업무 | 기본 샘플 | 유형 | 상태 | 채택일 | 사용 조건 |
|---|---|---|---|---|---|
| 접수·대상성·소관 검토 | `intake_jurisdiction_review_masked_example.md` | 구조 예시 | active | 2026-08-26 | 신고내용을 쟁점별로 분류하고 소관·보완 필요를 정리 |
| 담당부서 의견·조사결과 요청 | `department_opinion_request_masked_example.md` | 구조 예시 | active | 2026-08-21 | 조사부서와 요청 쟁점이 정해져 조사요청 공문 작성 |
| 담당부서 회신 검토 | `department_reply_review_masked_example.md` | 구조 예시 | active | 2026-08-26 | 부서 회신·증빙의 답변성, 근거, 누락과 조치상태를 대조 |
| 신고자 조사결과 통보 | `reporter_result_notice_masked_example.md` | 구조 예시 | active | 2026-08-21 | 조사와 내부 검토가 끝나 신고자에게 결과 통지 |
| 권익위 조사결과 회신 — 대외 공문 | `acrc_result_official_letter_masked_example.md` | 구조 예시 | active | 2026-08-26 | 국민권익위원회에 조사결과를 제출하는 시행 공문의 번호체계·문단 순서 작성 |
| 권익위 조사결과 제출용 서식 — 기본 개조식 | `acrc_result_notice_flat_masked_example.md` | HWPX·서식 구조 예시 | active | 2026-08-21 | 권익위 제출용 조사결과 서식 또는 빠른 HWPX 입력 구조 작성 |
| 권익위 조사결과 제출용 서식 — 2단 개조식 | `acrc_result_notice_two_level_masked_example.md` | HWPX·서식 구조 예시 | conditional | 2026-08-21 | 제출용 서식에서 둘 이상의 확인 사실에 서로 다른 조치·진행상황이 대응 |

`acrc_result_official_letter_masked_example.md`는 사용자 제공 시행 공문 샘플에서 확인된 번호체계와 문단 흐름을 비식별화한 **대외 공문용 구조 예시**다. 반면 `acrc_result_notice_flat_masked_example.md`와 `acrc_result_notice_two_level_masked_example.md`는 국민권익위원회 제출용 조사결과 서식·빠른 HWPX 입력을 위한 구조 예시이므로, 이를 시행 공문의 번호체계나 본문 구조로 사용하지 않는다.

신규·교체 시 `skills/guidance-repo-maintenance/references/deidentified_sample_publishing_standard.md`를 적용한다.

## Chat 사용 순서

1. `CHATGPT_ENTRYPOINT.md`와 `prompts/chat_mode/공익신고 검토/00_사용안내_및_업무판단.md`로 현재 업무를 판별한다.
2. 사용자가 현재 사건에 적용할 확정 샘플을 직접 지정했다면 그 샘플을 형식 기준으로 우선한다. 그렇지 않으면 이 카탈로그의 해당 업무 active 샘플을 실제로 연다.
3. `권익위 통보 공문`, `권익위 조사결과 회신 공문`처럼 **시행 공문**을 요청하면 `acrc_result_official_letter_masked_example.md`를 사용한다.
4. `권익위 제출용 서식`, `조사결과 서식`, `빠른 HWPX`처럼 **붙임 서식·HWPX 입력 구조**를 요청하면 `acrc_result_notice_flat_masked_example.md` 또는 적용 조건이 맞는 경우 `acrc_result_notice_two_level_masked_example.md`를 사용한다.
5. 선택한 샘플 파일명과 유형을 짧게 밝히고, 사건 원자료의 사실·신고 주장·부서 의견·확인 필요를 구분해 작성한다.
6. 파일을 열 수 없으면 읽었다고 가정하지 말고 경로와 미열람 사실을 알린다.

## 금지

- 샘플의 가상 번호·날짜·부서·연락처를 현재 사건의 확인값처럼 사용하지 않는다.
- 샘플만으로 공익신고 대상성, 소관, 법령, 처분상태와 통지범위를 확정하지 않는다.
- 신고자 통지용 문안, 국민권익위원회 시행 공문, 권익위 제출용 조사결과 서식을 서로 같은 양식으로 취급하지 않는다.
- HWPX·서식 구조 예시의 `## 필드명`을 실제 시행 공문의 문단 구조로 그대로 옮기지 않는다.
