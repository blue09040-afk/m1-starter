# 일상감사 규칙 묶음 관리

## 목적

제잡비율·노임·보험료율·고시금액·낙찰기준처럼 시점에 따라 바뀌는 값을 과거 사건에도 재현 가능하게 적용하기 위한 구조다.

## 원칙

1. 새 값으로 과거 값을 덮어쓰지 않는다.
2. 공식 원문과 적용일을 확인한 규칙만 `verified`로 표시한다.
3. 사건 기준일에 유효한 규칙만 후보로 선택한다.
4. 규칙 후보는 자동 결론이 아니며 사건 원자료와 공식 원문을 다시 대조한다.
5. 기존 의견서·정리 엑셀에서 추출한 규칙은 공식 검증 전 `candidate`로 둔다.
6. 사건 고유 사실·업체명·문서번호는 규칙 묶음에 넣지 않는다.

## 권장 구조

```text
rules/
├─ README.md
├─ rule_catalog.template.csv
├─ rule_index.template.json
├─ 2026-H1/
│  ├─ rule_catalog.csv
│  └─ source_log.md
└─ 2026-H2/
   ├─ rule_catalog.csv
   └─ source_log.md
```

반기 구분이 실제 시행기간과 다르면 `YYYY-MM-DD_YYYY-MM-DD`처럼 공식 적용기간을 폴더명으로 사용한다.

## 필수 필드

- `rule_id`
- `module`
- `title`
- `effective_from`
- `effective_to`
- `source_title`
- `source_url`
- `source_checked_on`
- `status`
- `condition`
- `result_instruction`
- `notes`

수치 규칙은 공식 출처를 확인한 뒤 별도 PR로 추가한다. 검증하지 않은 수치나 과거 의견서 값을 초기 기본값으로 넣지 않는다.
