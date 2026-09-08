import assert from "node:assert/strict"
import test from "node:test"
import JSZip from "jszip"
import { textOnlyPatchFallback } from "../src/text-patch-fallback.mjs"

async function syntheticTwoParagraphTitle({ duplicate = false, storedBoundarySpace = true } = {}) {
  const zip = new JSZip()
  zip.file("mimetype", "application/hwp+zip", { compression: "STORE", createFolders: false })
  const firstTitlePart = storedBoundarySpace ? "복잡 보고서 " : "복잡 보고서"
  const titleCell = `<hp:tc><hp:subList><hp:p paraPrIDRef="45"><hp:run charPrIDRef="47"><hp:t>${firstTitlePart}</hp:t></hp:run><hp:linesegarray/></hp:p><hp:p paraPrIDRef="45"><hp:run charPrIDRef="47"><hp:t>기준 제목</hp:t></hp:run><hp:linesegarray/></hp:p></hp:subList></hp:tc>`
  const duplicateParagraph = duplicate
    ? `<hp:p paraPrIDRef="1"><hp:run charPrIDRef="1"><hp:t>복잡 보고서 기준 제목</hp:t></hp:run></hp:p>`
    : ""
  zip.file(
    "Contents/section0.xml",
    `<?xml version="1.0" encoding="UTF-8"?><hs:sec xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph"><hp:p><hp:run><hp:tbl><hp:tr>${titleCell}</hp:tr></hp:tbl></hp:run></hp:p>${duplicateParagraph}</hs:sec>`,
    { createFolders: false },
  )
  return new Uint8Array(await zip.generateAsync({ type: "uint8array" }))
}

test("text fallback replaces one simple table-cell text slot and preserves structure", async () => {
  const bytes = await syntheticTwoParagraphTitle()
  const original = "복잡 보고서 기준 제목\n"
  const edited = "복잡 보고서 수정 제목\n"

  const result = await textOnlyPatchFallback(bytes, original, edited)
  assert.equal(result.changedLines, 1)
  assert.equal(result.tableCellChanges, 1)
  assert.equal(result.lineSegmentArraysRemoved, 2)
  assert.equal(result.previewRefreshed, true)

  const zip = await JSZip.loadAsync(result.bytes)
  const xml = await zip.file("Contents/section0.xml").async("string")
  assert.match(xml, />복잡 보고서 <\/hp:t>/)
  assert.match(xml, />수정 제목<\/hp:t>/)
  assert.doesNotMatch(xml, />기준 제목<\/hp:t>/)
  assert.doesNotMatch(xml.toLowerCase(), /linesegarray/)
})

test("text fallback supports a Kordoc-style virtual space between table-cell paragraphs", async () => {
  const bytes = await syntheticTwoParagraphTitle({ storedBoundarySpace: false })
  const result = await textOnlyPatchFallback(
    bytes,
    "복잡 보고서 기준 제목\n",
    "복잡 보고서 수정 제목\n",
  )
  const zip = await JSZip.loadAsync(result.bytes)
  const xml = await zip.file("Contents/section0.xml").async("string")
  assert.match(xml, />복잡 보고서<\/hp:t>/)
  assert.match(xml, />수정 제목<\/hp:t>/)
})

test("text fallback rejects structural Markdown lines", async () => {
  const bytes = await syntheticTwoParagraphTitle()
  await assert.rejects(
    () => textOnlyPatchFallback(bytes, "| 항목 | 값 |\n", "| 항목 | 변경 |\n"),
    (error) => error?.name === "TextPatchFallbackError" && /structural lines/.test(error.message),
  )
})

test("text fallback rejects ambiguous HWPX targets", async () => {
  const bytes = await syntheticTwoParagraphTitle({ duplicate: true })
  await assert.rejects(
    () => textOnlyPatchFallback(bytes, "복잡 보고서 기준 제목\n", "복잡 보고서 수정 제목\n"),
    (error) => error?.name === "TextPatchFallbackError" && /found 2/.test(error.message),
  )
})
