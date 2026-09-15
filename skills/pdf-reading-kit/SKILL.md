---
name: pdf-reading-kit
description: Use when the user needs to read, extract, convert, OCR, or diagnose PDF files, especially Korean administrative PDFs. This starter edition routes execution to the reusable `tools/PDF_READING_KIT/` source while excluding vendored packages and local OCR runtimes.
metadata:
  short-description: PDF extraction and OCR workflow
---

# PDF Reading Kit

## Source Acquisition Preflight

- Treat checked-in Markdown/OCR/extraction artifacts as first-pass reading aids, not automatic substitutes for the source PDF. If a table, layout, image, stamp/signature, page boundary, missing passage, or extraction ambiguity could change a factual or legal conclusion, inspect the original PDF before finalizing the judgment.
- When the source PDF is stored in an authenticated private GitHub repository and the connected GitHub MCP exposes `fetch_file(..., encoding="base64")`, use that route to retrieve the source content as Base64 instead of treating a generic UTF-8 fetch failure as "PDF unavailable." Follow `references/GITHUB_PDF_SOURCE_HANDOFF.md` for decoding, integrity checks, local handoff, and failure classification.
- Do not emit Base64 payloads into chat, logs, reusable guidance, or case summaries. Retrieval through the authenticated GitHub connector does not authorize sending the private PDF to Web, Acrobat, OCR, or another external service.
- Prefer an existing reliable extracted Markdown for speed, but use source-PDF verification whenever the derivative alone is insufficient for the conclusion.

## Core Workflow

1. Diagnose before OCR: distinguish text PDF, broken encoding/ToUnicode, image-only pages, permission restrictions and extraction-tool limitations.
2. If only some pages extract blank, inspect the source/page resources before declaring them blank or OCRing the whole document. Prefer selective OCR for the failed pages after a package/text extraction attempt.
3. Keep privacy masking off by default. Use masking only when explicitly requested, and distinguish text masking from flattened visual redaction.
4. For private case material, use local extraction first. External OCR or conversion requires explicit approval for the service and transfer target.
5. For local image-PDF assistance, prefer a verified local OneOCR runtime when available, then Tesseract, then Windows OCR. Treat OCR as a reading aid and recheck critical names, dates, amounts and legal citations against the source.
6. Use `tools/PDF_READING_KIT/` as the executable source. The starter intentionally does not include `vendor/`, `node_modules`, OneOCR binaries/models, caches or generated outputs.
7. Record the extraction method and remaining verification limits when PDF-derived text supports a substantive conclusion.

## Starter Setup

- Read `tools/PDF_READING_KIT/README.md` and `tools/PDF_READING_KIT/guides/PDF_READING_KIT_WORKFLOW.md` before first execution.
- Install Python dependencies from `tools/PDF_READING_KIT/requirements.txt` into the recipient's own environment rather than committing vendored packages.
- Keep `.env` local; only `.env.example` belongs in Git.

## References

- Read `references/GITHUB_PDF_SOURCE_HANDOFF.md` when a PDF lives in GitHub, especially a private repository, or when an existing extracted Markdown must be checked against the original PDF.

## Boundaries

- Do not send private/nonpublic PDFs to external services without explicit approval.
- Do not treat OCR output as authoritative when the source can be checked directly.
- Do not commit runtime DLLs/models, `.env`, extracted case text or generated PDFs/images.
