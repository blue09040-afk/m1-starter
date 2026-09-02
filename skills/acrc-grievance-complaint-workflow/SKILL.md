---
name: acrc-grievance-complaint-workflow
description: Use for folder-based Korean 국민권익위원회·도권익위원회 고충민원 work that follows 1단계 담당부서 의견·자료 요청, 2단계 권익위 설명·자료 제출, or 3단계 권익위 처리결과의 담당부서 통보, including archive-first case replacement and deidentified sample management. Do not use for ordinary complaints with no ACRC staged workflow or for public-interest reports.
metadata:
  short-description: ACRC grievance complaint 1-2-3 workflow
---

# ACRC Grievance Complaint Workflow

## Core Workflow

1. Confirm that the current folder and `HANDOFF_SUMMARY.md` refer to the same case; exclude previous-case archives and non-shareable reference originals from current-case inference.
2. Identify the current stage from the live materials: 1단계 department request, 2단계 ACRC explanation/material submission, or 3단계 department notice after ACRC disposition.
3. Separate the complainant's claims, confirmed record, department position, ACRC request or disposition, and remaining verification items.
4. Draft the substantive basis in Markdown first. Apply `admin-document-base-review`, the relevant document-reading skill, and `document-validation-pipeline` when finalizing outward- or approval-facing text.
5. Select the current stage's deidentified Markdown example through `templates/SAMPLE_CATALOG.md` and use it only as a structure reference. For HWP/HWPX form work, call `hwp-hwpx-processing`; do not treat a Markdown example as a binary template.
6. If the user requests case replacement, follow the archive-first procedure and never delete, overwrite, or guess through locks, collisions, or uncertain ownership.

## References

- Read `references/three_stage_workflow.md` for stage rules and source priority.
- Read `references/case_replacement.md` when replacing the current case.
- Read `references/sample_form_lifecycle.md` when promoting a confirmed form into a reusable deidentified Markdown example.
- Read `templates/SAMPLE_CATALOG.md` when selecting a stage-specific example or checking its status.
- For Chat mode without folder operations, use the independent prompts under `prompts/chat_mode/권익위 수행 검토/` as the Chat entrypoint.

## Output Expectations

- State the detected stage and the decisive materials used.
- Keep the 1단계 complaint summary stable in later stages unless new official material or the user requires a correction.
- Distinguish confirmed facts from positions and proposed language.
- Record missing records, conflicts, and values needing confirmation instead of inventing them.
