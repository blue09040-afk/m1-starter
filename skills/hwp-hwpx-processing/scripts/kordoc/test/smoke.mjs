import assert from "node:assert/strict"
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import JSZip from "jszip"
import { BUILTIN_TEMPLATES, readBuiltinTemplate, readBuiltinTemplateSample } from "kordoc"
import {
  EXPECTED_KORDOC_VERSION,
  analyzeFile,
  collectSources,
  extractToMarkdown,
  fillTemplate,
  patchFromEditedMarkdown,
  renderTemplateFromMarkdown,
  validateFile,
  writeFromMarkdown,
} from "../src/core.mjs"
import { renderPlaceholderTemplate } from "../src/hwpx-package.mjs"

async function previewText(hwpxPath) {
  const zip = await JSZip.loadAsync(await readFile(hwpxPath))
  const preview = zip.file("Preview/PrvText.txt")
  assert.ok(preview, "Preview/PrvText.txt must exist")
  return preview.async("string")
}

async function sectionTextOccurrences(hwpxPath, needle) {
  const zip = await JSZip.loadAsync(await readFile(hwpxPath))
  let count = 0
  for (const [name, entry] of Object.entries(zip.files)) {
    if (!/^Contents\/section\d+\.xml$/i.test(name) || entry.dir) continue
    const xml = await entry.async("string")
    count += xml.split(needle).length - 1
  }
  return count
}

function textOccurrences(text, needle) {
  return text.split(needle).length - 1
}

async function doesNotExist(filePath) {
  try {
    await access(filePath)
    return false
  } catch (error) {
    if (error?.code === "ENOENT") return true
    throw error
  }
}

test("write, extract, template, patch, fill, collect, validate, and no-overwrite safety", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-writing-"))
  try {
    const sourceMd = path.join(root, "source.md")
    const firstHwpx = path.join(root, "first.hwpx")
    const wrongWriteOutput = path.join(root, "wrong-output.md")
    const extractedMd = path.join(root, "extracted.md")
    const editedMd = path.join(root, "edited.md")
    const patchedHwpx = path.join(root, "patched.hwpx")
    const secondExtract = path.join(root, "patched.md")
    const collectedMd = path.join(root, "collected.md")
    const formHwpx = path.join(root, "form.hwpx")
    const valuesJson = path.join(root, "values.json")
    const filledHwpx = path.join(root, "filled.hwpx")
    const templateSourceMd = path.join(root, "template-source.md")
    const templateHwpx = path.join(root, "template.hwpx")
    const templateFieldsMd = path.join(root, "template-fields.md")
    const templatedHwpx = path.join(root, "templated.hwpx")
    const templatedExtract = path.join(root, "templated.md")
    const invalidFieldsMd = path.join(root, "invalid-fields.md")
    const invalidOutput = path.join(root, "invalid.hwpx")

    await writeFile(sourceMd, "# HWPX WRITING TEST\n\n문서 내용 12345\n", "utf8")

    await assert.rejects(
      writeFromMarkdown(sourceMd, wrongWriteOutput),
      /Unsupported output extension: \.md; expected \.hwpx/,
    )
    assert.equal(await doesNotExist(wrongWriteOutput), true)

    const written = await writeFromMarkdown(sourceMd, firstHwpx)
    assert.equal(written.kordocVersion, EXPECTED_KORDOC_VERSION)
    const initialValidation = await validateFile(firstHwpx)
    assert.equal(initialValidation.ok, true)

    await extractToMarkdown(firstHwpx, extractedMd)
    const extracted = await readFile(extractedMd, "utf8")
    assert.match(extracted, /12345/)

    await writeFile(editedMd, extracted.replace("12345", "67890"), "utf8")
    const patched = await patchFromEditedMarkdown(firstHwpx, editedMd, patchedHwpx)
    assert.ok(patched.applied >= 1)
    assert.equal(patched.previewRefreshed, true)
    assert.equal((await validateFile(patchedHwpx)).ok, true)
    const patchedPreview = await previewText(patchedHwpx)
    assert.match(patchedPreview, /67890/)
    assert.doesNotMatch(patchedPreview, /12345/)

    await extractToMarkdown(patchedHwpx, secondExtract)
    assert.match(await readFile(secondExtract, "utf8"), /67890/)

    await writeFile(templateSourceMd, "{{title}}\n\n{{body}}\n", "utf8")
    await writeFromMarkdown(templateSourceMd, templateHwpx)
    const templateAnalysis = await analyzeFile(templateHwpx)
    assert.deepEqual(templateAnalysis.placeholders, ["body", "title"])
    assert.deepEqual(templateAnalysis.splitPlaceholders, [])
    assert.deepEqual(templateAnalysis.duplicatePlaceholders, [])
    assert.equal(templateAnalysis.recommendedWorkflow, "template")

    await writeFile(
      templateFieldsMd,
      "## title\n작성 제목\n\n## body\n작성 본문 13579\n",
      "utf8",
    )
    const templated = await renderTemplateFromMarkdown(templateHwpx, templateFieldsMd, templatedHwpx)
    assert.equal(templated.fields, 2)
    assert.equal(templated.changedParagraphLineSegmentsRemaining, undefined)
    assert.equal(templated.previewRefreshed, true)
    assert.equal((await validateFile(templatedHwpx)).ok, true)
    assert.deepEqual((await analyzeFile(templatedHwpx)).placeholders, [])
    const templatedPreview = await previewText(templatedHwpx)
    assert.match(templatedPreview, /작성 제목/)
    assert.match(templatedPreview, /작성 본문 13579/)
    assert.doesNotMatch(templatedPreview, /\{\{title\}\}|\{\{body\}\}/)
    await extractToMarkdown(templatedHwpx, templatedExtract)
    assert.match(await readFile(templatedExtract, "utf8"), /작성 본문 13579/)

    await writeFile(invalidFieldsMd, "## title\n제목만 있음\n", "utf8")
    await assert.rejects(
      renderTemplateFromMarkdown(templateHwpx, invalidFieldsMd, invalidOutput),
      /missing Markdown fields: body/,
    )
    assert.equal(await doesNotExist(invalidOutput), true)

    const builtin = BUILTIN_TEMPLATES.find((item) => item.id === "gian-simple") ?? BUILTIN_TEMPLATES[0]
    assert.ok(builtin)
    const builtinSample = readBuiltinTemplateSample(builtin)
    await writeFile(formHwpx, Buffer.from(readBuiltinTemplate(builtin)))
    await writeFile(valuesJson, JSON.stringify(builtinSample), "utf8")
    const filled = await fillTemplate(formHwpx, valuesJson, filledHwpx)
    assert.ok(filled.filled >= 1)
    assert.equal(filled.previewRefreshed, true)
    assert.equal((await validateFile(filledHwpx)).ok, true)
    const filledPreview = await previewText(filledHwpx)
    assert.ok(filledPreview.trim().length > 0)
    const sampleTitle = builtinSample["제목"]
    assert.equal(typeof sampleTitle, "string")
    assert.equal(
      textOccurrences(filledPreview, sampleTitle),
      await sectionTextOccurrences(filledHwpx, sampleTitle),
      "PrvText must not duplicate table-cell text through ancestor paragraphs",
    )

    await collectSources([sourceMd, patchedHwpx], collectedMd)
    const collected = await readFile(collectedMd, "utf8")
    assert.match(collected, /HWPX-WRITING-COLLECT v1/)
    assert.match(collected, /source\.md/)
    assert.match(collected, /patched\.hwpx/)
    assert.match(collected, /67890/)

    await assert.rejects(
      writeFromMarkdown(sourceMd, firstHwpx),
      /Output already exists/,
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("template cache cleanup does not remove nested paragraph line segments", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-lineseg-"))
  try {
    const sourceMd = path.join(root, "source.md")
    const sourceHwpx = path.join(root, "source.hwpx")
    await writeFile(sourceMd, "{{outer}}\n", "utf8")
    await writeFromMarkdown(sourceMd, sourceHwpx)

    const zip = await JSZip.loadAsync(await readFile(sourceHwpx))
    const sectionName = Object.keys(zip.files).find((name) => /^Contents\/section\d+\.xml$/i.test(name))
    assert.ok(sectionName)
    const originalXml = await zip.file(sectionName).async("string")
    const outerLineSeg = '<hp:linesegarray><hp:lineseg textpos="111" vertpos="0" vertsize="100" textheight="100" baseline="80" spacing="0" horzpos="0" horzsize="100" flags="0"/></hp:linesegarray>'
    const nestedParagraph = '<hp:p paraPrIDRef="0" styleIDRef="0"><hp:run charPrIDRef="0"><hp:t>NESTED</hp:t></hp:run><hp:linesegarray><hp:lineseg textpos="222" vertpos="0" vertsize="100" textheight="100" baseline="80" spacing="0" horzpos="0" horzsize="100" flags="0"/></hp:linesegarray></hp:p>'
    assert.match(originalXml, /<hp:t>\{\{outer\}\}<\/hp:t>/)
    const nestedXml = originalXml.replace("</hp:p>", `${outerLineSeg}${nestedParagraph}</hp:p>`)
    assert.notEqual(nestedXml, originalXml)
    zip.file(sectionName, nestedXml)
    const nestedBytes = await zip.generateAsync({ type: "uint8array" })

    const rendered = await renderPlaceholderTemplate(nestedBytes, "## outer\nCHANGED\n")
    const outputZip = await JSZip.loadAsync(rendered.bytes)
    const outputXml = await outputZip.file(sectionName).async("string")
    assert.doesNotMatch(outputXml, /textpos="111"/)
    assert.match(outputXml, /textpos="222"/)
    assert.match(outputXml, />CHANGED</)
    assert.match(outputXml, />NESTED</)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
