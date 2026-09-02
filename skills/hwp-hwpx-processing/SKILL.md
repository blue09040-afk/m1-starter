---
name: hwp-hwpx-processing
description: Use when the user needs to read, convert, inspect, author, edit, validate, or package Korean HWP/HWPX documents. This starter edition keeps the reusable HWP conversion kit and Kordoc HWPX runtime while leaving local runtime payloads and case files out of Git.
metadata:
  short-description: HWP/HWPX conversion and Kordoc workflow
---

# HWP/HWPX Processing

## Core Workflow

1. Treat `.hwpx` as a ZIP/XML package and inspect `Preview/PrvText.txt` and `Contents/section*.xml` when text/package checks are enough.
2. Treat binary `.hwp` as a conversion source and use `tools/HWPX_READING_KIT/` for the official-converter path. Do not commit the converter runtime itself.
3. Keep masking off by default. If an AI-review text artifact needs masking, use an explicit opt-in path and preserve the original file.
4. Draft substantive text in Markdown first unless direct HWPX output is explicitly required.
5. When Node execution is available, use `scripts/kordoc/src/cli.mjs` for HWPX analyze/write/template/patch/fill/collect/validate operations.
6. Preserve reference-document structure where layout matters; do not rebuild complex forms from plain Markdown unless layout loss is acceptable.
7. A generated HWPX is not final merely because package validation passes. For final submission, verify in the actual target viewer when possible.

## References

- Read `references/HWPX_KORDOC_WRITING_RUNTIME.md` before executing the Kordoc path.
- For binary HWP conversion, follow `tools/HWPX_READING_KIT/README.md` and its workflow guide.

## Boundaries

- Do not commit `node_modules`, converter runtimes, DLL/model payloads, actual case HWPX files, extracted case text, or generated outputs.
- Do not claim visual verification when the file was not opened/rendered in an appropriate viewer.
- Do not overwrite source documents by default; write a separate output.
