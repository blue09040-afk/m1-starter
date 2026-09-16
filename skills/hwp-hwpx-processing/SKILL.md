---
name: hwp-hwpx-processing
description: Use when the user needs to read, convert, inspect, author, edit, validate, or package Korean HWP/HWPX documents. This starter edition keeps the reusable HWP conversion kit and Kordoc HWPX runtime while leaving local runtime payloads and case files out of Git.
metadata:
  short-description: HWP/HWPX conversion and Kordoc workflow
---

# HWP/HWPX Processing

## Core Workflow

1. For ordinary `.hwp` and `.hwpx` reading, prefer a **verified Kordoc parse-only route** when the current environment actually provides one. On Windows, `scripts/invoke_kordoc_reading.cmd` is the default reusable entry point: it checks `KORDOC_ONEOCR_HOME`, `C:\\Tools\\KordocOneOCR`, then the skill-local runtime and does not require a global `kordoc` command or PATH registration. A shell-level `kordoc` or `python -m kordoc` command-not-found result alone is not evidence that Kordoc is unavailable. Start with OCR, PIILOT, and privacy masking off. For HWPX, inspect `Preview/PrvText.txt`, `Contents/section*.xml`, embedded-image references, or warnings only when completeness or package structure needs a cross-check.
2. Treat successful native extraction as partial when scanned pages, embedded images, or warnings indicate possible missing task-relevant text. OCR only affected pages or images when feasible, and keep OCR as a labeled supplement rather than replacing reliable native text or tables.
3. For binary `.hwp`, use Kordoc first when a verified parse route is available. Try the Windows read-only wrapper before treating a missing global command as runtime absence. Use `tools/HWPX_READING_KIT/` and the official Hancom converter as a fallback or structural cross-check when Kordoc is actually unavailable, fails, looks incomplete, or exact HWPX package/layout inspection or editing is required. Do not request or launch HWP COM/OLE merely because `kordoc` is absent from PATH, and do not commit the converter runtime itself.
4. Keep masking off by default. If an AI-review text artifact needs masking, use an explicit opt-in path and preserve the original file.
5. Draft substantive text in Markdown first unless direct HWPX output is explicitly required.
6. When Node execution is available, use `scripts/kordoc/src/cli.mjs` for HWPX analyze/write/prepare-template/template/patch/fill/collect/validate operations. The presence of this authoring runtime alone does not prove that a generic HWP/PDF parse-only route is available.
7. Preserve reference-document structure where layout matters; do not rebuild complex forms from plain Markdown unless layout loss is acceptable.
8. A generated HWPX is not final merely because package validation passes. For final submission, verify in the actual target viewer when possible.

## References

- Read `references/HWPX_KORDOC_WRITING_RUNTIME.md` before executing the Kordoc authoring path.
- On Windows, use `scripts/invoke_kordoc_reading.cmd --version` to verify the reusable parse-only runtime before changing PATH or installing another package.
- For binary HWP conversion, follow `tools/HWPX_READING_KIT/README.md` and its workflow guide.

## Boundaries

- Do not commit `node_modules`, converter runtimes, DLL/model payloads, actual case HWPX files, extracted case text, or generated outputs.
- Do not claim visual verification when the file was not opened/rendered in an appropriate viewer.
- Do not overwrite source documents by default; write a separate output.
- Do not OCR an entire mixed document by default when only some pages failed package extraction.
