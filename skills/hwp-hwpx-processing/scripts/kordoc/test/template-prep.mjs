import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { parse } from "kordoc"
import {
  analyzeFile,
  prepareTemplateFromMap,
  renderTemplateFromMarkdown,
  writeFromMarkdown,
} from "../src/core.mjs"
import { parsePrepareMap } from "../src/template-prep.mjs"

test("prepare map rejects multiline and overlapping literals", () => {
  assert.throws(
    () => parsePrepareMap({ 제목: "첫째 줄\n둘째 줄" }),
    /single-line text value/,
  )
  assert.throws(
    () => parsePrepareMap({ 제목: "보고자료", 전체제목: "보고자료 제목" }),
    /must not overlap/,
  )
})

test("prepare-template turns unique literals into explicit placeholders and renders them", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-prepare-template-"))
  try {
    const sourceMd = path.join(root, "source.md")
    const input = path.join(root, "input.hwpx")
    const mapFile = path.join(root, "prepare.json")
    const prepared = path.join(root, "prepared.hwpx")
    const fields = path.join(root, "fields.md")
    const output = path.join(root, "output.hwpx")

    await writeFile(sourceMd, "기준 보고서 제목\n\n작성부서: 기준부서\n", "utf8")
    await writeFromMarkdown(sourceMd, input)
    await writeFile(mapFile, JSON.stringify({
      제목: "기준 보고서 제목",
      부서: "기준부서",
    }), "utf8")

    const result = await prepareTemplateFromMap(input, mapFile, prepared)
    assert.deepEqual(result.fields, ["부서", "제목"])
    assert.ok(result.applied >= 2)
    assert.equal(result.previewImagePresent, false)

    const analysis = await analyzeFile(prepared)
    assert.deepEqual(analysis.placeholders, ["부서", "제목"])
    assert.equal(analysis.recommendedWorkflow, "template")

    await writeFile(fields, "## 제목\n실제 보고서 제목\n\n## 부서\n감사부서\n", "utf8")
    await renderTemplateFromMarkdown(prepared, fields, output)

    const parsed = await parse(output)
    assert.equal(parsed.success, true)
    assert.match(parsed.markdown, /실제 보고서 제목/)
    assert.match(parsed.markdown, /작성부서: 감사부서/)
    assert.doesNotMatch(parsed.markdown, /기준 보고서 제목|기준부서|\{\{/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("prepare-template refuses missing or ambiguous literals without output", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-prepare-template-fail-"))
  try {
    const sourceMd = path.join(root, "source.md")
    const input = path.join(root, "input.hwpx")
    const missingMap = path.join(root, "missing.json")
    const duplicateMap = path.join(root, "duplicate.json")
    const missingOutput = path.join(root, "missing.hwpx")
    const duplicateOutput = path.join(root, "duplicate.hwpx")

    await writeFile(sourceMd, "반복문구\n\n반복문구\n", "utf8")
    await writeFromMarkdown(sourceMd, input)
    await writeFile(missingMap, JSON.stringify({ 제목: "없는문구" }), "utf8")
    await writeFile(duplicateMap, JSON.stringify({ 제목: "반복문구" }), "utf8")

    await assert.rejects(
      () => prepareTemplateFromMap(input, missingMap, missingOutput),
      (error) => error?.name === "ReviewRequiredError" && /found 0/.test(error.message),
    )
    await assert.rejects(
      () => prepareTemplateFromMap(input, duplicateMap, duplicateOutput),
      (error) => error?.name === "ReviewRequiredError" && /found 2/.test(error.message),
    )
    await assert.rejects(readFile(missingOutput), (error) => error?.code === "ENOENT")
    await assert.rejects(readFile(duplicateOutput), (error) => error?.code === "ENOENT")
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
