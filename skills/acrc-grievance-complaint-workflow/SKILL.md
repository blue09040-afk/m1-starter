---
name: acrc-grievance-complaint-workflow
description: Use for folder-based Korean 국민권익위원회·도권익위원회 고충민원 work that follows 1단계 담당부서 의견·자료 요청, 2단계 권익위 설명·자료 제출, 3단계 일반 처리결과 담당부서 통보, or 4단계 국민권익위원회 법 제46조제2항 의견표명 담당부서 통보, including archive-first case replacement and deidentified sample management. Do not use for ordinary complaints with no ACRC staged workflow or for public-interest reports.
metadata:
  short-description: ACRC grievance complaint 1-2-3-4 workflow
---

# ACRC Grievance Complaint Workflow

## Core Workflow

1. Confirm that the current folder and `HANDOFF_SUMMARY.md` refer to the same case; exclude previous-case archives and non-shareable reference originals from current-case inference.
2. Identify the current stage from the live materials: 1단계 department request, 2단계 ACRC explanation/material submission, 3단계 general department notice after disposition, or 4단계 Article 46(2) ACRC opinion-expression notice. **4단계는 시간상 3단계 다음 순번이 아니라, 최종 처리유형이 국민권익위원회의 법 제46조제2항 의견표명인 경우 3단계 대신 선택하는 전용 분기**이다.
3. Separate the complainant's claims, confirmed record, department position, ACRC request or disposition, and remaining verification items.
4. Before drafting, use `document-validation-pipeline` once to validate the detected stage, issue coverage, response scope, competent authority, conflicting material, and unresolved items. After drafting, check only that the text matches that validation unless the basis materially changes.
5. Draft the substantive basis in Markdown first. Apply `admin-document-base-review` and the relevant document-reading skill.
6. Select the current stage's deidentified Markdown example through `templates/SAMPLE_CATALOG.md` and use it only as a structure reference. For HWP/HWPX form work, call `hwp-hwpx-processing`; do not treat a Markdown example as a binary template.
7. If the user requests case replacement, follow the archive-first procedure and never delete, overwrite, or guess through locks, collisions, or uncertain ownership.

## References

- Read `references/four_stage_workflow.md` for stage rules and source priority.
- `references/three_stage_workflow.md` is retained only as a compatibility pointer to the four-stage reference.
- Read `references/case_replacement.md` when replacing the current case.
- Read `references/sample_form_lifecycle.md` when promoting a confirmed form into a reusable deidentified Markdown example.
- Read `templates/SAMPLE_CATALOG.md` when selecting a stage-specific example or checking its status.
- For Chat mode without folder operations, use the independent prompts under `prompts/chat_mode/권익위 수행 검토/` as the Chat entrypoint.

## Output Expectations

- State the detected stage and the decisive materials used.
- Keep the 1단계 complaint summary stable in later stages unless new official material or the user requires a correction.
- Distinguish confirmed facts from positions and proposed language.
- For 4단계 Article 46(2) cases, distinguish the **opinion-expression order** from the city's internal follow-up request and from non-order reasoning such as ordinance or institutional-improvement observations.
- Record missing records, conflicts, and values needing confirmation instead of inventing them.
