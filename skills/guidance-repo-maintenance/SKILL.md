---
name: guidance-repo-maintenance
description: Use when maintaining this reusable Korean administrative guidance repository or similar guidance packs, including creating/updating common guides, converting guides to skills, packaging reusable kits/prompts, recording lessons learned, adoption logs, stale-rule reviews, source logs, security preflight checks, or continuous-improvement loops. Do not use for one-off case facts unless they are being evaluated for reusable guidance promotion.
metadata:
  short-description: Guidance repo and skill maintenance
---

# Guidance Repo Maintenance

## Core Workflow

1. Inspect the live repository state before editing; do not assume previous patches fully landed.
2. Search existing routing, guides, skills, references, and prompts before adding a rule; choose one canonical owner for each rule.
3. Follow the ownership map in `references/reusable_guide_packaging_standard.md`; outside the canonical file, keep only the trigger or link needed for routing.
4. Separate one-off case facts, user preferences, reusable procedures, validation rules, and tool-failure recovery lessons.
5. Keep tentative lessons in candidate form until the user explicitly asks to adopt or promote them.
6. When creating or revising reusable packages, define trigger conditions, execution order, failure handling, output locations, and security/share checks.
7. For skills, keep `SKILL.md` concise and move detailed guides, examples, and prompts into one-level `references/`, `scripts/`, `templates/`, or `assets/`.
8. Update routing documents and adoption logs when a reusable change is adopted.

## References

- Read `references/reusable_guide_packaging_standard.md` for package structure and security preflight rules.
- Read `references/deidentified_sample_publishing_standard.md` when converting a confirmed document into a reusable deidentified Markdown structure or prose example.
- Read `references/continuous_improvement_loop.md` for lesson candidate, approval, adoption, and stale-review flow.
- Read `references/extract_lessons_learned.md` when extracting lessons.
- Read `references/promote_lesson_to_guideline.md` when promoting a lesson into shared guidance.

## Boundaries

- Do not auto-promote case-specific facts into shared guidance.
- Do not include `.env`, API keys, output folders, validation folders, internal documents, or real case payloads in shared packages.
- Do not duplicate a full rule across layers for discoverability; keep a short trigger or link outside its canonical file.
- Preserve this repository as the source of truth; installed skill copies should be synchronized from here.
