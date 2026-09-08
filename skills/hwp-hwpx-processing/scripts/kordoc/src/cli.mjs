#!/usr/bin/env node

import { parseArgs } from "node:util"
import {
  ReviewRequiredError,
  analyzeFile,
  collectSources,
  extractToMarkdown,
  fillTemplate,
  patchFromEditedMarkdown,
  prepareTemplateFromMap,
  renderTemplateFromMarkdown,
  validateFile,
  writeFromMarkdown,
} from "./core.mjs"

function usage() {
  return `hwpx-writing

Usage:
  node src/cli.mjs analyze <input.hwpx>
  node src/cli.mjs write <content.md> -o <output.hwpx> [--preset <preset>]
  node src/cli.mjs extract <input.hwpx> -o <output.md>
  node src/cli.mjs prepare-template <input.hwpx> <map.json> -o <template.hwpx>
  node src/cli.mjs template <template.hwpx> <fields.md> -o <output.hwpx>
  node src/cli.mjs patch <template.hwpx> <edited.md> -o <output.hwpx> [--allow-text-fallback]
  node src/cli.mjs fill <template.hwpx> <values.json> -o <output.hwpx> [--allow-label-fill]
  node src/cli.mjs collect <input1.hwpx|md> <input2.hwpx|md> [...] -o <output.md>
  node src/cli.mjs validate <input.hwpx>

Template contract:
  HWPX placeholders use {{field}} and must each be contained in one text node exactly once.
  fields.md uses matching '## field' blocks with plain-text values.
  Missing, extra, duplicate, split, or unresolved placeholders fail closed.

Presets:
  plain, official, report, plan, notice, minutes, gaejosik, press

Safety:
  Existing output files are never overwritten.
  template removes stale line-layout caches from changed paragraphs and refreshes PrvText.
  patch refuses to write when Kordoc reports skipped or residual edits.
  --allow-text-fallback only handles up to 10 unique plain-text line replacements and requires visual review.
  fill allows explicit CLICK_HERE fields by default and refuses heuristic label fill unless --allow-label-fill is supplied.
  --allow-label-fill results require render/open visual review before delivery.
  fill still refuses to write when requested labels are ambiguous or unmatched.
  patch/fill/template refresh Preview/PrvText.txt before final validation.
`
}

function parse(command, args) {
  const outputCommands = new Set(["write", "extract", "prepare-template", "template", "patch", "fill", "collect"])
  const common = outputCommands.has(command)
    ? { output: { type: "string", short: "o" } }
    : {}
  const options = command === "write"
    ? { ...common, preset: { type: "string", default: "plain" } }
    : command === "fill"
      ? { ...common, "allow-label-fill": { type: "boolean", default: false } }
      : command === "patch"
        ? { ...common, "allow-text-fallback": { type: "boolean", default: false } }
        : common
  return parseArgs({ args, options, allowPositionals: true, strict: true })
}

function requireOutput(values) {
  if (!values.output) throw new Error("-o/--output is required")
  return values.output
}

function requireCount(positionals, expected, command) {
  if (positionals.length !== expected) {
    throw new Error(`${command} requires ${expected} positional argument${expected === 1 ? "" : "s"}`)
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (!command || command === "help" || command === "--help" || command === "-h") {
    process.stdout.write(usage())
    return
  }

  const { values, positionals } = parse(command, args)
  let result

  switch (command) {
    case "analyze":
      requireCount(positionals, 1, command)
      result = await analyzeFile(positionals[0])
      break
    case "write":
      requireCount(positionals, 1, command)
      result = await writeFromMarkdown(positionals[0], requireOutput(values), { preset: values.preset })
      break
    case "extract":
      requireCount(positionals, 1, command)
      result = await extractToMarkdown(positionals[0], requireOutput(values))
      break
    case "prepare-template":
      requireCount(positionals, 2, command)
      result = await prepareTemplateFromMap(positionals[0], positionals[1], requireOutput(values))
      break
    case "template":
      requireCount(positionals, 2, command)
      result = await renderTemplateFromMarkdown(positionals[0], positionals[1], requireOutput(values))
      break
    case "patch":
      requireCount(positionals, 2, command)
      result = await patchFromEditedMarkdown(
        positionals[0],
        positionals[1],
        requireOutput(values),
        { allowTextFallback: values["allow-text-fallback"] },
      )
      break
    case "fill":
      requireCount(positionals, 2, command)
      result = await fillTemplate(
        positionals[0],
        positionals[1],
        requireOutput(values),
        { allowLabelFill: values["allow-label-fill"] },
      )
      break
    case "collect":
      if (positionals.length < 2) throw new Error("collect requires at least two inputs")
      result = await collectSources(positionals, requireOutput(values))
      break
    case "validate":
      requireCount(positionals, 1, command)
      result = await validateFile(positionals[0])
      if (!result.ok) process.exitCode = 1
      break
    default:
      throw new Error(`Unknown command: ${command}\n\n${usage()}`)
  }

  process.stdout.write(`${JSON.stringify({ ok: true, command, ...result }, null, 2)}\n`)
}

main().catch((error) => {
  const reviewRequired = error instanceof ReviewRequiredError
  process.stderr.write(`${JSON.stringify({
    ok: false,
    reviewRequired,
    error: error?.message || String(error),
  }, null, 2)}\n`)
  process.exitCode = reviewRequired ? 2 : 1
})
