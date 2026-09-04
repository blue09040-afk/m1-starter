---
name: document-validation-pipeline
description: Use when a substantive Korean administrative case review determines facts, issues, scope, competent authority, or legal effect, and when its outward-facing or approval-facing draft must be checked against that review. Run substantive validation once before drafting, then perform only a brief consistency check after drafting unless the basis materially changes. Also use whenever the user asks for validation, 자동검증, 누락 점검, 위험 표현 점검, or final consistency checks. Do not use for small one-line edits unless the risk is high.
metadata:
  short-description: Administrative document validation
---

# Document Validation Pipeline

## Core Workflow

1. Identify the current case-review basis: source files, claims or requests, department positions, legal checks, user-confirmed choices, and unresolved items.
2. Before drafting, validate the case review once for missing or conflicting material, separation of claims/facts/inferences, omitted or unnecessarily expanded issues, proportional scope and recipients, authority and time-relevant law, necessary-minimum data sharing, and unresolved risk.
3. Record the result in `_validation/validation_report.md`. Add source maps, legal logs, unresolved-item tables, or separate risk summaries only when the case is complex or resumability requires them.
4. After drafting, append a brief consistency check to the same report: confirm that the draft matches the validated case review and did not introduce new omissions, overstatement, or errors. Do not repeat the full validation unless new evidence or a material change affects the issues, scope, authority, or legal basis; then revalidate only the affected parts.
5. For HWPX outputs, additionally validate content agreement, required package files, stale internal text, style-reference preservation, and visual/manual review status.
6. If an already validated and unchanged basis is only being transferred into HWPX, reuse the prior substantive validation and run only HWPX-specific content-parity, package, stale-text, style, and visual-status checks.
7. Revise the final text only where the validation result justifies it, preserving user-confirmed choices.

## Chat Mode Boundary

- In general Chat, run the same one-time pre-draft case-review validation and brief post-draft consistency check for substantial administrative work even when the user did not separately ask to "validate" it.
- Apply the content checks that can be performed from the materials actually available in the conversation: unsupported statements, omitted issues, factual/legal/authority overstatement, action-status mismatch, dates/numbers/names, privacy exposure, unresolved verification status, and user-confirmed choices.
- Do not treat Codex-only file operations as Chat obligations. `_validation/` folder creation, local scripts, HWPX XML/package/style checks, and other file-system validation are performed only when the relevant file work is actually available and in scope.
- Validation is a quality and risk-control aid, not a substitute for independent source verification. If a legal rule, authority, date, or other conclusion-driving fact has not been verified, mark it for verification rather than passing it by self-review alone.

## Reference Map

Use this section as the short routing layer before opening a reference. For a long reference, narrow the target with headings, keywords, or partial reads first; load the full file only when the validation scope actually requires broader context.

- `hwp-hwpx-processing/references/HWPX_FAST_DRAFT_WORKFLOW.md`
  - Purpose: compact HWPX-only checks for a pass-only fast draft whose substantive text is already reviewed and unchanged.
  - Read when: the fast-draft conditions are met. Do not load the full validation reference unless a warning or fallback condition appears.
- `references/validation_pipeline.md`
  - Purpose: detailed pre-draft case-review validation and post-draft consistency checks for unsupported statements, issue omissions or over-expansion, legal/factual overstatement, action status, privacy, source mapping, and final risks.
  - Read when: a substantive case review is complete and drafting will begin, there is a material basis change, a user requests full validation, or a fast-draft warning appears.
  - Skip/reduce when: only an unchanged reviewed basis is being transferred into a warning-free fast HWPX draft.
- `references/run_validation.md`
  - Purpose: execution steps when the user explicitly asks to run validation.
- `references/revise_final_reply.md`
  - Purpose: applying validated changes back into a final reply while preserving confirmed choices.

## Output Expectations

- Mark each issue as `pass`, `needs revision`, `needs verification`, `intentional`, or `not applicable`.
- Keep the final user report short: whether the case review was validated, whether the draft matched it, what changed, and what remains risky.
- Do not let validation become an approval gate; it is a quality and risk-control aid.
