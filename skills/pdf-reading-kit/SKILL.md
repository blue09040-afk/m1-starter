---
name: pdf-reading-kit
description: Use when the user needs to read, extract, convert, OCR, or diagnose PDF files, especially Korean administrative PDFs. This starter edition routes execution to the reusable `tools/PDF_READING_KIT/` source while excluding vendored packages and local OCR runtimes.
metadata:
  short-description: PDF extraction and OCR workflow
---

# PDF Reading Kit

## Core Workflow

1. Diagnose before OCR: distinguish text PDF, broken encoding/ToUnicode, image-only pages, permission restrictions and extraction-tool limitations.
2. If only some pages extract blank, inspect the source/page resources before declaring them blank or OCRing the whole document.
3. Keep privacy masking off by default. Use masking only when explicitly requested, and distinguish text masking from flattened visual redaction.
4. For private case material, use local extraction first. External OCR or conversion requires explicit approval for the service and transfer target.
5. For local image-PDF assistance, prefer a verified local OneOCR runtime when available, then Tesseract, then Windows OCR. Treat OCR as a reading aid and recheck critical names, dates, amounts and legal citations against the source.
6. Use `tools/PDF_READING_KIT/` as the executable source. The starter intentionally does not include `vendor/`, `node_modules`, OneOCR binaries/models, caches or generated outputs.
7. Record the extraction method and remaining verification limits when PDF-derived text supports a substantive conclusion.

## Starter Setup

- Read `tools/PDF_READING_KIT/README.md` and `tools/PDF_READING_KIT/guides/PDF_READING_KIT_WORKFLOW.md` before first execution.
- Install Python dependencies from `tools/PDF_READING_KIT/requirements.txt` into the recipient's own environment rather than committing vendored packages.
- Keep `.env` local; only `.env.example` belongs in Git.

## Boundaries

- Do not send private/nonpublic PDFs to external services without explicit approval.
- Do not treat OCR output as authoritative when the source can be checked directly.
- Do not commit runtime DLLs/models, `.env`, extracted case text or generated PDFs/images.
