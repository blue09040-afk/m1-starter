---
name: public-interest-report-review
description: Use when a Korean matter is or may be a 공익신고, public-interest report, 권익위-related report, whistleblower protection issue, or complaint that needs public-interest eligibility, competent authority, notification, confidentiality, or 개인정보 checks. Do not use for ordinary complaint drafting unless public-interest report classification or protection duties are actually in issue.
metadata:
  short-description: Public-interest report review
---

# Public Interest Report Review

## Core Workflow

1. Confirm whether the filing is treated as a public-interest report, ordinary complaint, audit reference, external-agency matter, or mixed matter.
2. Classify each allegation separately; not every allegation in a public-interest filing is itself a public-interest infringement issue.
3. Check competent authority by issue type, location, delegated office, and whether the matter belongs to city, district, eup/myeon/dong, business office, or an external agency.
4. Draft responses with clear scope: reviewed facts, limits of review, transferred or excluded issues, and items needing supplementation.
5. Check confidentiality, reporter protection, and personal-data exposure before any outward-facing text.
6. If legal effect or authority matters, verify the current and time-relevant legal basis and record verification status.
7. Before drafting a substantive investigation request, review, notice, or reply, use `document-validation-pipeline` once to validate issue coverage, scope, competent authority, proportional recipients, and necessary-minimum data sharing. After drafting, check only that the text matches that validation unless the basis materially changes.

## Reference Map

Use this section as the short routing layer before opening a reference. For a long reference, narrow the target with headings, keywords, or partial reads first; load the full file only when broader context is actually needed.

- `references/public_interest_report_checklist.md`
  - Purpose: full criteria for public-interest eligibility, issue classification, competent authority, reply scope, confidentiality, and protection checks.
  - Read when: eligibility/classification is disputed, authority or protection duties affect the result, the reply standard is unclear, or an earlier judgment needs re-checking.
  - Skip/reduce when: the matter is already classified and only an unrelated drafting or file-format task remains. Do not re-read it mechanically at every paragraph or stage.
- `references/case_operations.md`
  - Purpose: operational handling for department investigation requests, department reply review, reporter result notices, ACRC replies, deidentified Markdown samples, and archive-first case replacement.
  - Read when: one of those operational steps is actually being performed.
- `templates/SAMPLE_CATALOG.md`
  - Purpose: maps each public-interest workflow step to the active deidentified Markdown structure example.
  - Read when: drafting or reviewing a stage-specific work product in Chat or Codex.
- Use `admin-document-base-review` for general administrative drafting principles.
- Use `document-validation-pipeline` after the case scope is set and before drafting substantive text; after drafting, perform only the brief consistency check defined there.
- Use `hwaseong-staff-lookup` when Hwaseong department or 담당자 routing is needed.
- Use `hwp-hwpx-processing` separately when reading a source HWP/HWPX or reflecting an already reviewed Markdown basis into HWPX. The Markdown examples in `templates/` are structural references, not binary form templates.

## Output Expectations

- Distinguish `public-interest report issue`, `ordinary complaint/audit reference`, `external agency or separate procedure`, `needs supplementation`, and `excluded from review`.
- State what can be confirmed from the record and what needs department, law, or source re-check.
- Avoid exposing reporter identity, third-party personal information, or unnecessary internal details.
