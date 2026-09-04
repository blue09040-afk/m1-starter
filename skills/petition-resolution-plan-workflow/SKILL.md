---
name: petition-resolution-plan-workflow
description: Use for Korean 진정민원 1단계 work where a complaint or audit unit reviews a newly received petition and asks the competent department to submit `진정사항 관련 추진내용 및 향후 해소계획`, including review of prior incoming/outgoing complaint records and drafting the variable `< 민원 내용 및 요청사항 정리 >` section while preserving the fixed form outside that section. Do not use for 국민권익위원회 고충민원 1·2·3단계 or 공익신고 workflows.
metadata:
  short-description: Petition resolution-plan stage 1
---

# Petition Resolution Plan Workflow

## Core Workflow

1. Confirm that the matter is `진정민원 1단계`: the current petition has been received, the competent department's current resolution-plan reply has not yet arrived, and the immediate task is to request `진정사항 관련 추진내용 및 향후 해소계획`.
2. Review the current petition together with only the prior incoming/outgoing complaint records that are actually provided for this case. Separate the complainant's allegations and requests, confirmed facts, prior department explanations, and items still needing verification.
3. Identify whether the current filing raises a new issue, continues an unresolved issue, or repeats an already answered point. Merge genuine duplicates, but do not drop a materially distinct allegation or request that can affect the later reply merely for brevity.
4. Separate what the competent department can actually explain or verify from matters that the complaint/audit unit itself, another department, or another institution must confirm. Do not force the competent department to answer the complaint/audit unit's own processing history or matters outside its authority.
5. Design verification items that can produce a meaningful factual answer. Do not repeat questions about facts already confirmed from reliable records merely to obtain the same answer again. When the issue is whether a review actually occurred or how it was documented, prefer asking for the existence and content of review reports, internal approval materials, work memos, consultation records, or other contemporaneous records.
6. If a prior reply announced a future consultation, technical review, site visit, corrective action, or other follow-up, request its current status and remaining plan when that status is relevant to resolving the petition.
7. Draft or revise only the variable `< 민원 내용 및 요청사항 정리 >` section unless the user explicitly asks to change the form. Preserve the fixed wording and structure outside that section.
8. After the issue and competent-department scope are set, read `templates/SAMPLE_CATALOG.md` and the active stage-1 deidentified structure example, then apply `document-validation-pipeline` once before drafting. Apply `admin-document-base-review` for general administrative drafting and, after drafting, perform only the pipeline's brief consistency check unless the basis materially changes.

## Stage Boundary

- `진정민원 2단계` is reserved for the follow-up work after the department's resolution-plan reply and evidence arrive: review that reply and draft the answer to the complainant.
- This skill currently implements only stage 1. Until a separate stage-2 procedure and sample are adopted, handle stage-2 work with `admin-document-base-review` and do not mechanically reuse the stage-1 box-drafting rules.

## References

- Read `references/stage1_department_resolution_plan_request.md` for source priority, issue compression, competent-department scope, verification-question design, neutral tone, and the fixed-form boundary.
- Read `templates/SAMPLE_CATALOG.md` and the selected active sample whenever drafting or reviewing the stage-1 request.
- Use `hwaseong-staff-lookup` only when the competent department itself needs to be identified or re-checked.
- Use `hwp-hwpx-processing` only for actual HWP/HWPX reading, editing, or generation. The Markdown sample is a structural reference, not a binary template.

## Output Expectations

- State that the work is `진정민원 1단계` and identify the decisive materials used.
- Keep complaint allegations, prior department explanations, confirmed facts, competent-department verification needs, and other-unit verification needs distinguishable.
- Produce a concise, directly usable `< 민원 내용 및 요청사항 정리 >` draft without rewriting the fixed form outside the box.
- Record missing records or unresolved factual conflicts instead of inventing a conclusion.
