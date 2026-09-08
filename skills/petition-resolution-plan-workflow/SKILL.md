---
name: petition-resolution-plan-workflow
description: Use for Korean 진정민원 1단계 work that requests a competent department's `진정사항 관련 추진내용 및 향후 해소계획`, or 2단계 work that reviews the department reply and evidence and drafts the reply to the petitioner. Do not use for 국민권익위원회·도권익위원회 고충민원 staged workflows, public-interest reports, or ordinary complaints without this petition process.
metadata:
  short-description: Petition workflow stages 1 and 2
---

# Petition Resolution Plan Workflow

## Stage Routing

1. Use `진정민원 1단계` when the petition has been received but the competent department's current resolution-plan reply has not yet arrived, and the immediate task is to request `진정사항 관련 추진내용 및 향후 해소계획`.
2. Use `진정민원 2단계` when that department reply or related evidence has arrived and the task is to assess its sufficiency, obtain any necessary supplementation, and draft the reply to the petitioner.
3. If the request came from the 국민권익위원회 or a provincial ombudsman body under its own staged workflow, use `acrc-grievance-complaint-workflow`. Do not relabel that process as this skill's stage 2 merely because a department reply exists.

## Core Workflow

### Stage 1

1. Read `references/stage1_department_resolution_plan_request.md` and follow its source, scope, fixed-form, and verification-question rules.
2. Read `templates/SAMPLE_CATALOG.md` and the active stage-1 sample.
3. Apply `document-validation-pipeline` once after setting the issues and competent-department scope and before drafting. Draft only the variable `< 민원 내용 및 요청사항 정리 >` section unless the user asks to change the fixed form.
4. After drafting, perform only a brief consistency check unless the factual basis materially changes.

### Stage 2

1. Read `references/stage2_department_reply_review.md`, `templates/SAMPLE_CATALOG.md`, and the stage-2 sample selected for the case structure.
2. Build an issue-level comparison of the petition, prior replies or promised follow-up, the current department reply, submitted evidence, verified facts, and unresolved gaps. A department assertion is not by itself proof that the underlying act or review occurred.
3. Before drafting the petitioner reply, apply `document-validation-pipeline` once to confirm the decisive facts, issue coverage, authority boundary, evidentiary support, and the need for supplementation. In Codex or another file-capable workspace, record the result in `_validation/validation_report.md`; in ordinary Chat, provide the equivalent structured validation in the response.
4. If a decisive gap can reasonably be cured, prepare a focused supplementation request and defer the affected conclusion. When new material arrives, revalidate only the affected issues and any dependent conclusion instead of rerunning unrelated work.
5. Draft the petitioner reply using the current case's approved form first and the catalogued sample only as a structural aid. Attribute allegations and disputed explanations, distinguish confirmed facts from planned action, and do not extend a department's authority or a legal effect beyond the record.
6. After drafting, compare the reply briefly with the pre-draft validation result. Rerun substantive validation only when new evidence or a changed issue basis could alter the conclusion.

## Stage Boundary

- Stage 1 asks for facts, records, and a resolution plan; stage 2 tests the reply and evidence and communicates a supported outcome to the petitioner. Do not reuse the stage-1 box as the stage-2 reply format.
- A partial or conclusory department reply does not move the case backward to stage 1. Keep it in stage 2 and use the supplementation loop.
- An ordinary complaint reply with no preceding petition resolution-plan process remains outside this skill and routes to `admin-document-base-review`.

## References

- Read `references/stage1_department_resolution_plan_request.md` for source priority, issue compression, competent-department scope, verification-question design, neutral tone, and the fixed-form boundary.
- Read `references/stage2_department_reply_review.md` for the stage-2 comparison matrix, sufficiency test, supplementation loop, validation checkpoint, drafting rules, and output differences between Codex and ordinary Chat.
- Read `templates/SAMPLE_CATALOG.md` and the selected catalogued sample whenever drafting or reviewing a stage-1 request or stage-2 petitioner reply.
- Use `hwaseong-staff-lookup` only when the competent department itself needs to be identified or re-checked.
- Use `hwp-hwpx-processing` only for actual HWP/HWPX reading, editing, or generation. The Markdown sample is a structural reference, not a binary template.

## Output Expectations

- State whether the work is `진정민원 1단계` or `진정민원 2단계` and identify the decisive materials used.
- At stage 1, produce a concise, directly usable `< 민원 내용 및 요청사항 정리 >` draft without rewriting the fixed form outside the box.
- At stage 2, provide the issue-level review, supplementation needs if any, the validation result, and a directly usable petitioner-reply draft. Omit internal working detail when the user asks only for the final reply, but retain genuine limitations and approval checks.
- Record missing records or unresolved factual conflicts instead of inventing a conclusion.
