---
name: document-validation-pipeline
description: Use after drafting or revising substantive Korean outward-facing or approval-facing documents such as final replies, complaint responses, investigation reports, review memos, or HWPX final drafts. Apply substantive validation by default when finalizing a substantial administrative document, and also whenever the user asks for validation, 자동검증, 누락 점검, 위험 표현 점검, or final consistency checks. Do not use for small one-line edits unless the risk is high.
metadata:
  short-description: Administrative document validation
---

# Document Validation Pipeline

## Core Workflow

1. Identify the final-basis document and any source files, department opinions, legal checks, user final instructions, and unresolved items.
2. Validate for unsupported statements, omitted allegations, factual/legal overstatement, action-status mismatch, dates/numbers/names, privacy exposure, and outward-facing tone.
3. For HWPX outputs, additionally validate content agreement, required package files, stale internal text, style-reference preservation, and visual/manual review status.
4. If an already reviewed and unchanged final-basis text is only being transferred into HWPX, reuse the prior substantive validation and run only HWPX-specific content-parity, package, stale-text, style, and visual-status checks.
5. Record results in a concise validation report when the task is substantial or resumability matters. A pass-only fast HWPX draft uses a compact pass/fail summary and does not create a separate report unless a warning is found, the user requests a full report, or the document is being finalized for approval/dispatch.
6. Revise the final text only where the validation result justifies it, preserving user-confirmed choices.

## Chat Mode Boundary

- In general Chat, substantive validation is still required for substantial administrative review documents and outward-facing or approval-facing final text even when the user did not separately ask to "validate" it.
- Apply the content checks that can be performed from the materials actually available in the conversation: unsupported statements, omitted issues, factual/legal/authority overstatement, action-status mismatch, dates/numbers/names, privacy exposure, unresolved verification status, and user-confirmed choices.
- Do not treat Codex-only file operations as Chat obligations. `_validation/` folder creation, local scripts, HWPX XML/package/style checks, and other file-system validation are performed only when the relevant file work is actually available and in scope.
- Validation is a quality and risk-control aid, not a substitute for independent source verification. If a legal rule, authority, date, or other conclusion-driving fact has not been verified, mark it for verification rather than passing it by self-review alone.

## Reference Map

Use this section as the short routing layer before opening a reference. For a long reference, narrow the target with headings, keywords, or partial reads first; load the full file only when the validation scope actually requires broader context.

- `hwp-hwpx-processing/references/HWPX_FAST_DRAFT_WORKFLOW.md`
  - Purpose: compact HWPX-only checks for a pass-only fast draft whose substantive text is already reviewed and unchanged.
  - Read when: the fast-draft conditions are met. Do not load the full validation reference unless a warning or fallback condition appears.
- `references/validation_pipeline.md`
  - Purpose: detailed substantive validation for unsupported statements, issue omissions, legal/factual overstatement, action status, privacy, source mapping, and final-risk checks.
  - Read when: there is substantive revision, Chat-mode substantive validation, final approval/dispatch validation, a user-requested full validation, or a fast-draft warning.
  - Skip/reduce when: only an unchanged reviewed basis is being transferred into a warning-free fast HWPX draft.
- `references/run_validation.md`
  - Purpose: execution steps when the user explicitly asks to run validation.
- `references/revise_final_reply.md`
  - Purpose: applying validated changes back into a final reply while preserving confirmed choices.

## Output Expectations

- Mark each issue as `pass`, `needs revision`, `needs verification`, `intentional`, or `not applicable`.
- Keep the final user report short: what was checked, what changed, what remains risky.
- Do not let validation become an approval gate; it is a quality and risk-control aid.
