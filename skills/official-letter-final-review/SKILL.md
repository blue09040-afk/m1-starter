---
name: official-letter-final-review
description: Use when the user asks for final polishing, 결재 전 검토, 공문 최종검토, 회신문 문안 다듬기, tone/risk cleanup, or a skeptical recipient-side review of a mostly drafted Korean official letter, complaint reply, investigation report, or approval-facing document. Do not use for early-stage fact gathering or document extraction.
metadata:
  short-description: Final official-letter review
---

# Official Letter Final Review

## Core Workflow

1. Identify the current final-basis draft and do not re-litigate earlier discarded drafts unless the user asks.
2. Review from both institutional responsibility and recipient-side readability.
3. Check conclusion, key reasons, legal basis, factual boundaries, action status, and remaining checks.
4. Remove unsupported legal/factual accusations, overbroad denials, defensive wording, and unnecessary personal or internal details.
5. Preserve user-confirmed wording choices unless they create a concrete legal, factual, or privacy risk.
6. Provide immediately usable revised wording plus a concise list of high-risk issues or remaining checks.

## References

- Read `references/official_letter_final_review_detail.txt` for the full detailed review guide.
- Use `document-validation-pipeline` when final text should be validated after revision.
- Use `admin-document-base-review` for general Korean administrative writing standards.

## Output Expectations

- Lead with the revised or recommended final text when that is what the user needs.
- Separate mandatory corrections from optional style improvements.
- If a point cannot be verified, mark the exact phrase or fact that needs re-check.
