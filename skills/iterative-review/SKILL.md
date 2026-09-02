---
name: iterative-review
description: Use when the user explicitly asks for a repeated review loop such as 반복 재검토, 반복검토, 재검토 반복, 수정 필요 없을 때까지 재검토, or equivalent instructions that clearly require review, direct correction, and re-review until no substantive revision remains.
metadata:
  short-description: Iterative third-party review until stable
---

# Iterative Review

## Trigger Boundary

Apply this skill only when the user clearly requests a **repeated review loop**, for example:

- `반복 재검토`
- `반복검토`
- `재검토 반복`
- `수정 필요 없을 때까지 재검토`
- `검토하고 직접 수정한 뒤 다시 재검토를 반복`

A request to review from a `제3자 관점` or `처음 보는 입장` is a review stance, not by itself a repeated-loop trigger. Standalone `독립검토`, `독립검토-1/2/3`, and the existing blind/cross/red-team workflow remain separate.

## Core Workflow

1. Freeze the current work product and the user's confirmed constraints as the baseline.
2. Review it from a fresh third-party perspective and identify only material problems.
3. Fix resolvable material problems directly; leave unresolved material uncertainty as `확인 필요`.
4. Treat the revision as the new baseline and review it again without defending the previous edit.
5. Stop when another pass finds no substantive change that improves correctness, completeness, consistency, safety, or usability.

## Reference

Read `references/iterative_review_protocol.md` when the work product is substantive, multi-part, approval-facing, outward-facing, legally sensitive, or when the stopping rule is unclear. The reference is the canonical detailed procedure and guardrail set.

## Output Expectations

- Preserve the stabilized result in the medium of the current task. If authorized file or repository edits are in scope, apply the fixes directly there instead of reproducing every file in the final response.
- For text-only work, return the final corrected version rather than every intermediate draft unless the user asks for the review history.
- Briefly report the material changes and whether the final pass found any remaining substantive issue.
- If used with a formatting skill such as `bold-revision-review`, finish the substantive iterative review first and apply formatting only to the stabilized final version.
