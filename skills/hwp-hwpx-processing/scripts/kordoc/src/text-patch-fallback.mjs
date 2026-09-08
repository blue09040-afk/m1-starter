import JSZip from "jszip"
import { DOMParser, XMLSerializer } from "@xmldom/xmldom"
import { analyzeHwpxPackage, refreshPreviewText } from "./hwpx-package.mjs"

export class TextPatchFallbackError extends Error {
  constructor(message) {
    super(message)
    this.name = "TextPatchFallbackError"
  }
}

function localName(node) {
  return String(node?.localName || node?.nodeName || "").split(":").at(-1)
}

function elementsByLocalName(root, name) {
  return [...root.getElementsByTagName("*")].filter((element) => localName(element) === name)
}

function ownedDescendants(paragraph, predicate) {
  return [...paragraph.getElementsByTagName("*")].filter((node) => {
    if (!predicate(node)) return false
    let parent = node.parentNode
    while (parent && parent !== paragraph) {
      if (localName(parent) === "p") return false
      parent = parent.parentNode
    }
    return parent === paragraph
  })
}

function ownedTextNodes(paragraph) {
  return ownedDescendants(paragraph, (node) => localName(node) === "t")
}

function ownedRuns(paragraph) {
  return ownedDescendants(paragraph, (node) => localName(node) === "run")
}

function removeOwnedLineSegments(paragraph) {
  let removed = 0
  for (const node of ownedDescendants(
    paragraph,
    (item) => localName(item).toLowerCase() === "linesegarray",
  )) {
    if (node.parentNode) {
      node.parentNode.removeChild(node)
      removed += 1
    }
  }
  return removed
}

function ancestor(node, name) {
  let current = node?.parentNode
  while (current) {
    if (localName(current) === name) return current
    current = current.parentNode
  }
  return null
}

function parseXml(xml, label) {
  const errors = []
  const parser = new DOMParser({
    onError: (level, message) => {
      if (level !== "warning") errors.push(String(message))
    },
  })
  const doc = parser.parseFromString(xml, "application/xml")
  if (!doc || errors.length > 0) {
    throw new Error(`${label} parse failed: ${errors.slice(0, 3).join("; ") || "document not created"}`)
  }
  return doc
}

function sectionNames(zip) {
  return Object.keys(zip.files)
    .filter((name) => /^Contents\/section\d+\.xml$/i.test(name) && !zip.files[name].dir)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

function plainLineChanges(originalMarkdown, editedMarkdown) {
  const original = String(originalMarkdown).replace(/\r\n/g, "\n").split("\n")
  const edited = String(editedMarkdown).replace(/\r\n/g, "\n").split("\n")
  if (original.length !== edited.length) {
    throw new TextPatchFallbackError("Text fallback only supports edits that preserve Markdown line count")
  }

  const changes = []
  for (let i = 0; i < original.length; i += 1) {
    if (original[i] === edited[i]) continue
    const before = original[i]
    const after = edited[i]
    if (!before || !after || before !== before.trim() || after !== after.trim()) {
      throw new TextPatchFallbackError("Text fallback only supports non-empty trimmed line replacements")
    }
    if (/^(?:\||<|#{1,6}\s|[-*+]\s|>\s|```)/.test(before) || /^(?:\||<|#{1,6}\s|[-*+]\s|>\s|```)/.test(after)) {
      throw new TextPatchFallbackError("Text fallback does not modify Markdown structural lines")
    }
    changes.push({ line: i + 1, before, after })
  }
  if (changes.length === 0) throw new TextPatchFallbackError("Edited Markdown contains no text changes")
  if (changes.length > 10) throw new TextPatchFallbackError("Text fallback is limited to at most 10 changed lines")
  return changes
}

function paragraphText(paragraph) {
  return ownedTextNodes(paragraph).map((node) => node.textContent ?? "").join("")
}

function isSimpleParagraph(paragraph) {
  const texts = ownedTextNodes(paragraph)
  const runs = ownedRuns(paragraph)
  return texts.length === 1 && runs.length === 1 && Boolean(paragraphText(paragraph).trim())
}

function sameStyle(paragraphs) {
  const paraStyles = new Set(paragraphs.map((p) => p.getAttribute("paraPrIDRef") || ""))
  const charStyles = new Set(paragraphs.flatMap((p) => ownedRuns(p).map((r) => r.getAttribute("charPrIDRef") || "")))
  return paraStyles.size === 1 && charStyles.size === 1
}

function cellParagraphs(cell) {
  return elementsByLocalName(cell, "p")
    .filter((paragraph) => ancestor(paragraph, "tc") === cell)
    .filter((paragraph) => paragraphText(paragraph).trim())
}

function combinedParagraphText(paragraphs) {
  if (paragraphs.length === 0) return ""
  let value = paragraphText(paragraphs[0])
  for (const paragraph of paragraphs.slice(1)) {
    const next = paragraphText(paragraph)
    if (!/\s$/.test(value) && !/^\s/.test(next)) value += " "
    value += next
  }
  return value
}

function findCandidates(doc, before) {
  const candidates = []
  for (const paragraph of elementsByLocalName(doc, "p")) {
    if (ancestor(paragraph, "tc")) continue
    if (isSimpleParagraph(paragraph) && paragraphText(paragraph) === before) {
      candidates.push({ kind: "paragraph", paragraphs: [paragraph] })
    }
  }

  for (const cell of elementsByLocalName(doc, "tc")) {
    const paragraphs = cellParagraphs(cell)
    if (paragraphs.length === 0) continue
    if (!paragraphs.every(isSimpleParagraph) || !sameStyle(paragraphs)) continue
    if (combinedParagraphText(paragraphs) === before) {
      candidates.push({ kind: "table-cell", paragraphs })
    }
  }
  return candidates
}

function splitByOriginalLengths(after, paragraphs) {
  if (paragraphs.length === 1) return [after]
  const chars = [...after]
  const oldTexts = paragraphs.map(paragraphText)
  const oldLengths = oldTexts.map((value) => [...value].length)
  const total = oldLengths.reduce((sum, value) => sum + value, 0)
  const pieces = []
  let start = 0
  let accumulated = 0

  for (let i = 0; i < paragraphs.length - 1; i += 1) {
    accumulated += oldLengths[i]
    const target = Math.round(chars.length * accumulated / total)
    const remainingBoundaries = paragraphs.length - i - 2
    const candidates = []
    for (let index = start + 1; index < chars.length - 1; index += 1) {
      if (!/\s/.test(chars[index])) continue
      const remainingWhitespace = chars.slice(index + 1).filter((char) => /\s/.test(char)).length
      if (remainingWhitespace < remainingBoundaries) continue
      candidates.push(index)
    }
    if (candidates.length === 0) {
      throw new TextPatchFallbackError("Text fallback cannot preserve a multi-paragraph text boundary without a whitespace split point")
    }
    candidates.sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)
    const boundary = candidates[0]
    const leftStoresWhitespace = /\s$/.test(oldTexts[i])
    const rightStoresWhitespace = /^\s/.test(oldTexts[i + 1])
    let left = chars.slice(start, boundary).join("")
    if (leftStoresWhitespace) left += chars[boundary]
    pieces.push(left)
    start = rightStoresWhitespace ? boundary : boundary + 1
  }
  pieces.push(chars.slice(start).join(""))
  if (pieces.some((piece) => !piece.trim())) {
    throw new TextPatchFallbackError("Text fallback would create an empty paragraph while preserving text boundaries")
  }
  return pieces
}

function setParagraphText(paragraph, value, doc) {
  const nodes = ownedTextNodes(paragraph)
  if (nodes.length !== 1) throw new TextPatchFallbackError("Fallback target paragraph is no longer simple")
  const node = nodes[0]
  while (node.firstChild) node.removeChild(node.firstChild)
  node.appendChild(doc.createTextNode(value))
  return removeOwnedLineSegments(paragraph)
}

function structureSignature(analysis) {
  return {
    sections: analysis.sections,
    paragraphs: analysis.paragraphs,
    runs: analysis.runs,
    tables: analysis.tables,
    images: analysis.images,
  }
}

export async function textOnlyPatchFallback(originalBytes, originalMarkdown, editedMarkdown) {
  const changes = plainLineChanges(originalMarkdown, editedMarkdown)
  const beforeAnalysis = await analyzeHwpxPackage(originalBytes)
  const zip = await JSZip.loadAsync(originalBytes)
  const serializer = new XMLSerializer()
  let lineSegmentArraysRemoved = 0
  let tableCellChanges = 0

  for (const change of changes) {
    const matches = []
    for (const name of sectionNames(zip)) {
      const xml = await zip.file(name).async("string")
      const doc = parseXml(xml, name)
      const candidates = findCandidates(doc, change.before)
      for (const candidate of candidates) matches.push({ name, doc, candidate })
    }
    if (matches.length !== 1) {
      throw new TextPatchFallbackError(
        `Fallback source line ${change.line} must map to exactly one simple HWPX text slot; found ${matches.length}`,
      )
    }

    const { name, doc, candidate } = matches[0]
    const pieces = splitByOriginalLengths(change.after, candidate.paragraphs)
    candidate.paragraphs.forEach((paragraph, index) => {
      lineSegmentArraysRemoved += setParagraphText(paragraph, pieces[index], doc)
    })
    if (candidate.kind === "table-cell") tableCellChanges += 1
    zip.file(name, serializer.serializeToString(doc), { createFolders: false })
  }

  const interim = await zip.generateAsync({ type: "uint8array" })
  const preview = await refreshPreviewText(interim)
  const afterAnalysis = await analyzeHwpxPackage(preview.bytes)
  if (JSON.stringify(structureSignature(afterAnalysis)) !== JSON.stringify(structureSignature(beforeAnalysis))) {
    throw new TextPatchFallbackError("Text fallback changed HWPX paragraph/run/table/image structure")
  }

  return {
    bytes: preview.bytes,
    changedLines: changes.length,
    tableCellChanges,
    lineSegmentArraysRemoved,
    ...preview,
  }
}
