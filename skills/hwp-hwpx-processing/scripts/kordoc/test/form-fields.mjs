import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import JSZip from "jszip"
import { BUILTIN_TEMPLATES, readBuiltinTemplate, renderHwpxToSvg } from "kordoc"
import { analyzeFile, fillTemplate, renderTemplateFromMarkdown, writeFromMarkdown } from "../src/core.mjs"

function clickHereField(id, name, value) {
  return `<hp:p>\n    <hp:run><hp:ctrl><hp:fieldBegin id="${id}" type="CLICK_HERE" name="${name}"/></hp:ctrl></hp:run>\n    <hp:run><hp:t>${value}</hp:t></hp:run>\n    <hp:run><hp:ctrl><hp:fieldEnd beginIDRef="${id}"/></hp:ctrl></hp:run>\n  </hp:p>`
}

async function writeSyntheticFormHwpx(filePath, { placeholder = false } = {}) {
  const zip = new JSZip()
  const placeholderParagraph = placeholder
    ? "<hp:p><hp:run><hp:t>{{본문}}</hp:t></hp:run></hp:p>"
    : ""
  const section = `<?xml version="1.0" encoding="UTF-8"?>\n<hs:sec xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph">\n  ${clickHereField(1, "성명", "홍길동")}\n  ${clickHereField(2, "연락처", "010")}\n  ${clickHereField(3, "연락처", "031")}\n  ${placeholderParagraph}\n  <hp:p><hp:run><hp:fieldBegin id="4" type="HYPERLINK" name="링크"/></hp:run></hp:p>\n</hs:sec>`
  zip.file("Contents/section0.xml", section, { createFolders: false })
  await writeFile(filePath, await zip.generateAsync({ type: "uint8array" }))
}

async function writeBuiltinMixedForm(filePath, template) {
  const zip = await JSZip.loadAsync(new Uint8Array(readBuiltinTemplate(template)))
  const entry = zip.file("Contents/section0.xml")
  assert.ok(entry, "gian-simple section0.xml is missing")
  const xml = await entry.async("string")
  const closeIndex = xml.lastIndexOf("</")
  assert.ok(closeIndex > 0, "gian-simple section root closing tag is missing")
  const mixed = `${xml.slice(0, closeIndex)}<hp:p><hp:run><hp:t>{{본문}}</hp:t></hp:run></hp:p>${xml.slice(closeIndex)}`
  zip.file("Contents/section0.xml", mixed, { createFolders: false })
  await writeFile(filePath, await zip.generateAsync({ type: "uint8array" }))
}

test("analyze detects Kordoc CLICK_HERE fields and recommends fill", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-form-fields-"))
  try {
    const input = path.join(root, "form.hwpx")
    await writeSyntheticFormHwpx(input)

    const result = await analyzeFile(input)

    assert.deepEqual(result.formFields, ["성명", "연락처"])
    assert.deepEqual(result.formFieldOccurrences, { 성명: 1, 연락처: 2 })
    assert.deepEqual(result.duplicateFormFields, ["연락처"])
    assert.equal(result.recommendedWorkflow, "fill")
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("analyze reports a two-step workflow when placeholders and CLICK_HERE fields coexist", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-mixed-form-"))
  try {
    const input = path.join(root, "mixed.hwpx")
    await writeSyntheticFormHwpx(input, { placeholder: true })

    const result = await analyzeFile(input)

    assert.deepEqual(result.placeholders, ["본문"])
    assert.deepEqual(result.formFields, ["성명", "연락처"])
    assert.equal(result.recommendedWorkflow, "template-then-fill")
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("analyze exposes heuristic label-form counts without document labels", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-label-form-"))
  try {
    const markdown = path.join(root, "form.md")
    const input = path.join(root, "form.hwpx")
    await writeFile(markdown, "| 항목 | 내용 |\n| --- | --- |\n| 성명 |  |\n| 주소 |  |\n", "utf8")
    await writeFromMarkdown(markdown, input)

    const result = await analyzeFile(input)

    assert.equal(result.labelFormConfidence, 1)
    assert.equal(result.labelFormFieldCount, 3)
    assert.equal(result.emptyLabelFormFieldCount, 2)
    assert.equal("labelFormFields" in result, false)
    assert.equal("emptyLabelFormFields" in result, false)
    assert.equal(result.formFields.length, 0)
    assert.equal(result.recommendedWorkflow, "patch-or-write")
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("core fill blocks heuristic label fill unless explicitly opted in", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-safe-label-fill-"))
  try {
    const markdown = path.join(root, "form.md")
    const input = path.join(root, "form.hwpx")
    const values = path.join(root, "values.json")
    const blockedOutput = path.join(root, "blocked.hwpx")
    const allowedOutput = path.join(root, "allowed.hwpx")

    await writeFile(markdown, "| 항목 | 내용 |\n| --- | --- |\n| 성명 |  |\n", "utf8")
    await writeFromMarkdown(markdown, input)
    await writeFile(values, JSON.stringify({ 성명: "테스트" }), "utf8")

    await assert.rejects(
      () => fillTemplate(input, values, blockedOutput),
      (error) => error?.name === "ReviewRequiredError" && /--allow-label-fill/.test(error.message),
    )
    await assert.rejects(readFile(blockedOutput), (error) => error?.code === "ENOENT")

    const allowed = await fillTemplate(input, values, allowedOutput, { allowLabelFill: true })
    assert.equal(allowed.filled, 1)
    assert.equal(allowed.fillMode, "label-heuristic")
    assert.equal(allowed.labelFillRequestedCount, 1)
    assert.equal(allowed.visualReviewRequired, true)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("Kordoc built-in gian-simple analyzes, fills, validates, and renders", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-builtin-form-"))
  try {
    const template = BUILTIN_TEMPLATES.find((item) => item.id === "gian-simple")
    assert.ok(template, "Kordoc gian-simple template is missing")

    const input = path.join(root, "gian-simple.hwpx")
    const values = path.join(root, "values.json")
    const output = path.join(root, "filled.hwpx")
    await writeFile(input, new Uint8Array(readBuiltinTemplate(template)))

    const analysis = await analyzeFile(input)
    assert.ok(analysis.formFields.length > 0)
    assert.ok(analysis.formFields.includes("생산등록번호"))
    assert.equal(analysis.recommendedWorkflow, "fill")

    await writeFile(values, JSON.stringify({
      생산등록번호: "TEST-2026-001",
      제목: "HWPX 품질 검증",
    }), "utf8")
    const filled = await fillTemplate(input, values, output)
    assert.equal(filled.filled, 2)
    assert.equal(filled.fillMode, "click-here")
    assert.equal(filled.visualReviewRequired, false)
    assert.equal(filled.previewImagePresent, false)
    assert.equal(filled.previewImageRemoved, true)

    const rendered = await renderHwpxToSvg(new Uint8Array(await readFile(output)), { reflow: true })
    assert.ok(rendered.pageCount >= 1)
    assert.ok(rendered.svg.includes("<svg"))
    assert.ok(rendered.stats.tables >= 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("template-then-fill preserves CLICK_HERE fields through both writes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-two-step-form-"))
  try {
    const template = BUILTIN_TEMPLATES.find((item) => item.id === "gian-simple")
    assert.ok(template, "Kordoc gian-simple template is missing")

    const input = path.join(root, "mixed.hwpx")
    const fields = path.join(root, "fields.md")
    const templated = path.join(root, "templated.hwpx")
    const values = path.join(root, "values.json")
    const output = path.join(root, "filled.hwpx")
    await writeBuiltinMixedForm(input, template)

    const before = await analyzeFile(input)
    assert.equal(before.recommendedWorkflow, "template-then-fill")
    assert.ok(before.formFields.includes("생산등록번호"))

    await writeFile(fields, "## 본문\n혼합 양식 본문\n", "utf8")
    await renderTemplateFromMarkdown(input, fields, templated)
    const afterTemplate = await analyzeFile(templated)
    assert.deepEqual(afterTemplate.placeholders, [])
    assert.ok(afterTemplate.formFields.includes("생산등록번호"))
    assert.equal(afterTemplate.recommendedWorkflow, "fill")

    await writeFile(values, JSON.stringify({ 생산등록번호: "MIXED-2026-001" }), "utf8")
    const filled = await fillTemplate(templated, values, output)
    assert.equal(filled.filled, 1)
    assert.equal(filled.fillMode, "click-here")

    const rendered = await renderHwpxToSvg(new Uint8Array(await readFile(output)), { reflow: true })
    assert.ok(rendered.pageCount >= 1)
    assert.ok(rendered.svg.includes("혼합 양식 본문"))
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
