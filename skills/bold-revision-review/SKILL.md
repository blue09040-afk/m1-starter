---
name: bold-revision-review
description: Use when the user says "굵은 수정안", "굵은 수정안 검토해줘", "수정한 부분은 굵게 표시", or asks to review and polish a Korean official, complaint, audit, or administrative document and provide the revised content as a Markdown file with changed wording marked in bold. Use after extracting source text from HWP/HWPX/PDF/ODT/MD with the relevant document-processing skill.
metadata:
  short-description: Bold-marked Markdown revision review
---

# Bold Revision Review

## Core Workflow

1. Identify the current final-basis document and review that version first. Do not return to discarded drafts unless the user asks.
2. If the document is HWP/HWPX/PDF/ODT, read or convert it with the relevant document-processing skill before judging the wording.
3. Review for official-document tone, factual boundaries, unsupported conclusions, duplicate requests, missing deadlines or attachments, privacy exposure, and recipient-side clarity.
4. Preserve user-confirmed wording choices unless they create a concrete factual, legal, privacy, or procedural risk.
5. Do not fill in blanks that the receiving department is supposed to complete. Leave those fields as a form unless the user explicitly asks otherwise.
6. If edits are needed, create a Markdown correction draft or memo. Do not silently edit HWP/HWPX or other binary documents unless the user explicitly asks for a binary output.
7. Mark only changed, added, or strongly recommended replacement wording in **bold**. Do not bold entire unchanged paragraphs.
8. Separate mandatory corrections from optional style improvements when useful.

## Output Expectations

- Prefer a Markdown file in the current work folder, with a filename such as `<source_stem>_굵은수정안.md` or a task-specific Korean name.
- Lead with the revised text when the user asks for "수정된 내용으로 제공".
- Include a short review note only for concrete risks, remaining checks, or places where no edit is needed.
- Report the source document and extraction method in the final response when HWP/HWPX/PDF/ODT text was extracted.

## Related Skills

- Use `official-letter-final-review` for deeper final official-letter tone and risk review.
- Use `document-validation-pipeline` when the revised text needs a separate validation pass.
- Use `hwp-hwpx-processing` or `pdf-reading-kit` when source text must be extracted from binary or scanned documents.
