---
name: admin-document-base-review
description: Use when reviewing, drafting, or organizing Korean administrative, complaint, audit, investigation, or official-document work that needs 공문서 tone, fact/inference separation, legal-source caution, privacy minimization, and case-output design. Do not use as the only skill for public-interest report classification, final letter polishing, PDF/HWP extraction, or HWPX authoring when a more specific skill applies.
metadata:
  short-description: Korean administrative document baseline
---

# Admin Document Base Review

## Core Judgment

- Identify the current source and intended deliverable. Read the local instructions and the materials that can change this judgment; open handoff or validation notes only when they are relevant.
- Use evidence to separate established facts, inference, and unresolved questions, and draft in Korean official-document style.
- Check conclusion-driving legal rules, authority, and time against official sources, and keep outward-facing personal and nonpublic details to the necessary minimum.
- Preserve user-confirmed choices and report the usable result with material changes, verification limits, or risks when they matter. Do not prescribe a fixed sequence or create classification tables, plans, status labels, or extra files merely to demonstrate that the workflow ran.
- Apply the relevant substantive, format, final-review, or revision-memory skill when its trigger is met. For common administrative judgment, consult only the needed sections of `guides/BASE_INSTRUCTIONS.md`.

## References

- Read `references/start_case_review.md` when beginning a new case review.
- Use more specific skills when their trigger conditions apply:
  - `public-interest-report-review` for public-interest report handling.
  - `official-letter-final-review` for final polishing before approval or dispatch.
  - `document-validation-pipeline` once after substantive case review and before drafting; after drafting, use only its brief consistency check unless the basis materially changes.
  - `document-revision-memory` when the user's own verified Private memory repository is available, confirmed prior user preferences or reusable drafting patterns can improve the first draft, or reusable patterns should be distilled from user-confirmed edits.
  - `pdf-reading-kit` or `hwp-hwpx-processing` for fragile document extraction or HWPX work.
  - `admin-source-lookup` for 법령·담당부서·필지·고시·웹 PDF lookup before considering Firecrawl or broad/general web search; minimal Web discovery of an unknown official URL is allowed by that skill.

## Boundaries

- Do not turn one-off case facts into general rules.
- Do not invent final legal or institutional decisions when the record only supports a bounded review.
- Do not mechanically create validation artifacts for tiny checks; scale artifacts to risk and reuse value.
- Memory is supplemental context only. Current case evidence, official sources, the user's current instruction, and canonical `m1-starter` guidance take precedence.
