import JSZip from "jszip"
import { DOMParser, XMLSerializer } from "@xmldom/xmldom"

const FIELD_RE = /^##\s+(.+?)\s*$/
const UNSUPPORTED_FIELD_MARKDOWN_RE = /(\*\*|__|`{3}|^\s*\|.*\|\s*$)/m

function placeholderMatches(text) {
  return [...String(text ?? "").matchAll(/\{\{([^{}\r\n]+)\}\}/g)]
}

function parseXml(xml, label = "XML") {
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

function localName(node) {
  return String(node?.localName || node?.nodeName || "").split(":").at(-1)
}

function elementsByLocalName(root, name) {
  return [...root.getElementsByTagName("*")].filter((element) => localName(element) === name)
}

function countStructure(doc) {
  return {
    paragraphs: elementsByLocalName(doc, "p").length,
    tables: elementsByLocalName(doc, "tbl").length,
    images: elementsByLocalName(doc, "pic").length,
    runs: elementsByLocalName(doc, "run").length,
  }
}

function textNodes(doc) {
  return elementsByLocalName(doc, "t")
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

function ownedLineSegments(paragraph) {
  return ownedDescendants(paragraph, (node) => localName(node).toLowerCase() === "linesegarray")
}

function sectionEntryNames(zip) {
  return Object.keys(zip.files)
    .filter((name) => /^Contents\/section\d+\.xml$/i.test(name) && !zip.files[name].dir)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

function buildPreviewFromSectionDocs(sectionDocs) {
  const lines = []
  for (const doc of sectionDocs) {
    for (const paragraph of elementsByLocalName(doc, "p")) {
      const text = ownedTextNodes(paragraph)
        .map((node) => node.textContent ?? "")
        .join("")
        .trim()
      if (text) lines.push(text)
    }
  }
  return lines.join("\n") + (lines.length ? "\n" : "")
}

function removeLineSegments(paragraph) {
  let removed = 0
  for (const node of ownedLineSegments(paragraph)) {
    if (node.parentNode) {
      node.parentNode.removeChild(node)
      removed += 1
    }
  }
  return removed
}

function remainingLineSegments(paragraph) {
  return ownedLineSegments(paragraph).length
}

export function parseTemplateMarkdown(markdown) {
  const fields = new Map()
  let current = null

  for (const rawLine of String(markdown).replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const match = rawLine.match(FIELD_RE)
    if (match) {
      const name = match[1].trim()
      if (!name) throw new Error("Empty Markdown field heading")
      if (fields.has(name)) throw new Error(`Duplicate Markdown field: ${name}`)
      fields.set(name, [])
      current = name
      continue
    }
    if (/^###(?:\s|$)/.test(rawLine)) {
      throw new Error("Nested Markdown headings are not supported in template fields")
    }
    if (current === null) {
      if (rawLine.trim()) throw new Error("Template Markdown must start with a '## field' heading")
      continue
    }
    fields.get(current).push(rawLine)
  }

  if (fields.size === 0) throw new Error("No '## field' blocks were found")

  const result = new Map()
  for (const [name, lines] of fields) {
    while (lines.length && !lines[0].trim()) lines.shift()
    while (lines.length && !lines.at(-1).trim()) lines.pop()
    const value = lines.join("\n")
    if (!value) throw new Error(`Empty Markdown field: ${name}`)
    if (UNSUPPORTED_FIELD_MARKDOWN_RE.test(value)) {
      throw new Error(`Unsupported Markdown formatting in field '${name}'; template fields are plain text`)
    }
    if (placeholderMatches(value).length > 0) {
      throw new Error(`Field '${name}' contains placeholder syntax; nested placeholders are not supported`)
    }
    result.set(name, value)
  }
  return result
}

async function analyzeLoadedZip(zip) {
  const names = Object.keys(zip.files)
  const sections = sectionEntryNames(zip)
  if (sections.length === 0) throw new Error("HWPX has no Contents/section*.xml entries")

  const occurrenceCounts = new Map()
  const concatenatedCounts = new Map()
  let paragraphs = 0
  let tables = 0
  let images = 0
  let runs = 0

  for (const name of sections) {
    const xml = await zip.file(name).async("string")
    const doc = parseXml(xml, name)
    const structure = countStructure(doc)
    paragraphs += structure.paragraphs
    tables += structure.tables
    images += structure.images
    runs += structure.runs

    const nodes = textNodes(doc)
    for (const node of nodes) {
      for (const match of placeholderMatches(node.textContent)) {
        const field = match[1].trim()
        occurrenceCounts.set(field, (occurrenceCounts.get(field) ?? 0) + 1)
      }
    }
    const joined = nodes.map((node) => node.textContent ?? "").join("")
    for (const match of placeholderMatches(joined)) {
      const field = match[1].trim()
      concatenatedCounts.set(field, (concatenatedCounts.get(field) ?? 0) + 1)
    }
  }

  const splitPlaceholders = [...concatenatedCounts]
    .filter(([field, count]) => (occurrenceCounts.get(field) ?? 0) < count)
    .map(([field]) => field)
    .sort()
  const placeholders = [...new Set([...occurrenceCounts.keys(), ...concatenatedCounts.keys()])].sort()
  const duplicatePlaceholders = placeholders
    .filter((field) => (occurrenceCounts.get(field) ?? 0) > 1)

  return {
    zipEntries: names.length,
    sections: sections.length,
    paragraphs,
    runs,
    tables,
    images,
    placeholders,
    placeholderOccurrences: Object.fromEntries(
      placeholders.map((field) => [field, occurrenceCounts.get(field) ?? 0]),
    ),
    splitPlaceholders,
    duplicatePlaceholders,
    previewTextPresent: Boolean(zip.file("Preview/PrvText.txt")),
    previewImagePresent: Boolean(zip.file("Preview/PrvImage.png")),
    recommendedWorkflow: placeholders.length > 0 ? "template" : "patch-or-write",
  }
}

export async function analyzeHwpxPackage(bytes) {
  const zip = await JSZip.loadAsync(bytes)
  return analyzeLoadedZip(zip)
}

async function repackHwpx(zip) {
  const names = Object.keys(zip.files)
  if (!zip.file("mimetype")) throw new Error("HWPX is missing mimetype")

  const output = new JSZip()
  const ordered = ["mimetype", ...names.filter((name) => name !== "mimetype")]
  for (const name of ordered) {
    const entry = zip.files[name]
    if (!entry) continue
    if (entry.dir) {
      output.file(name, new Uint8Array(), { dir: true, date: entry.date, createFolders: false })
      continue
    }
    const data = await entry.async("uint8array")
    const options = {
      binary: true,
      createFolders: false,
      date: entry.date,
      compression: name === "mimetype" ? "STORE" : "DEFLATE",
    }
    if (entry.comment) options.comment = entry.comment
    if (entry.unixPermissions != null) options.unixPermissions = entry.unixPermissions
    if (entry.dosPermissions != null) options.dosPermissions = entry.dosPermissions
    output.file(name, data, options)
  }
  return output.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  })
}

async function refreshPreviewInLoadedZip(zip) {
  const docs = []
  for (const name of sectionEntryNames(zip)) {
    docs.push(parseXml(await zip.file(name).async("string"), name))
  }
  const preview = buildPreviewFromSectionDocs(docs)
  const previewAdded = !zip.file("Preview/PrvText.txt")
  zip.file("Preview/PrvText.txt", preview, { createFolders: false })
  const previewImageRemoved = Boolean(zip.file("Preview/PrvImage.png"))
  if (previewImageRemoved) zip.remove("Preview/PrvImage.png")
  return {
    previewAdded,
    previewRefreshed: true,
    previewImagePresent: false,
    previewImageRemoved,
  }
}

export async function refreshPreviewText(bytes) {
  const zip = await JSZip.loadAsync(bytes)
  const preview = await refreshPreviewInLoadedZip(zip)
  return { bytes: await repackHwpx(zip), ...preview }
}

export async function renderPlaceholderTemplate(bytes, markdown) {
  const fields = parseTemplateMarkdown(markdown)
  const zip = await JSZip.loadAsync(bytes)
  const before = await analyzeLoadedZip(zip)

  if (before.splitPlaceholders.length > 0) {
    throw new Error(`Placeholders must be contained in one text node: ${before.splitPlaceholders.join(", ")}`)
  }
  if (before.duplicatePlaceholders.length > 0) {
    throw new Error(`Template placeholders must be unique: ${before.duplicatePlaceholders.join(", ")}`)
  }

  const templateFields = new Set(before.placeholders)
  const markdownFields = new Set(fields.keys())
  const missingMarkdown = [...templateFields].filter((field) => !markdownFields.has(field)).sort()
  const extraMarkdown = [...markdownFields].filter((field) => !templateFields.has(field)).sort()
  if (missingMarkdown.length > 0 || extraMarkdown.length > 0) {
    const problems = []
    if (missingMarkdown.length > 0) problems.push(`missing Markdown fields: ${missingMarkdown.join(", ")}`)
    if (extraMarkdown.length > 0) problems.push(`fields absent from template: ${extraMarkdown.join(", ")}`)
    throw new Error(problems.join("; "))
  }
  if (templateFields.size === 0) throw new Error("Template contains no {{field}} placeholders")

  let changedParagraphs = 0
  let lineSegmentArraysRemoved = 0
  let changedParagraphLineSegmentsRemaining = 0
  let changedSections = 0
  const serializer = new XMLSerializer()

  for (const name of sectionEntryNames(zip)) {
    const xml = await zip.file(name).async("string")
    const doc = parseXml(xml, name)
    const beforeStructure = countStructure(doc)
    let sectionChanged = false

    for (const paragraph of elementsByLocalName(doc, "p")) {
      let paragraphChanged = false
      for (const node of ownedTextNodes(paragraph)) {
        let value = node.textContent ?? ""
        for (const match of placeholderMatches(value)) {
          const field = match[1].trim()
          if (!fields.has(field)) continue
          value = value.replace(match[0], fields.get(field))
        }
        if (value !== (node.textContent ?? "")) {
          while (node.firstChild) node.removeChild(node.firstChild)
          node.appendChild(doc.createTextNode(value))
          paragraphChanged = true
          sectionChanged = true
        }
      }
      if (paragraphChanged) {
        changedParagraphs += 1
        lineSegmentArraysRemoved += removeLineSegments(paragraph)
        changedParagraphLineSegmentsRemaining += remainingLineSegments(paragraph)
      }
    }

    if (!sectionChanged) continue
    if (changedParagraphLineSegmentsRemaining > 0) {
      throw new Error("Line segment cache removal failed for changed template paragraphs")
    }
    const serialized = serializer.serializeToString(doc)
    const reparsed = parseXml(serialized, `${name} after template render`)
    const afterStructure = countStructure(reparsed)
    for (const key of ["paragraphs", "tables", "images", "runs"]) {
      if (beforeStructure[key] !== afterStructure[key]) {
        throw new Error(`Template render changed ${key} structure in ${name}`)
      }
    }
    zip.file(name, serialized, { createFolders: false })
    changedSections += 1
  }

  if (changedSections === 0) throw new Error("No template placeholders were replaced")
  const after = await analyzeLoadedZip(zip)
  if (after.placeholders.length > 0) {
    throw new Error(`Unresolved placeholders remain: ${after.placeholders.join(", ")}`)
  }

  const preview = await refreshPreviewInLoadedZip(zip)
  return {
    bytes: await repackHwpx(zip),
    fields: [...fields.keys()],
    changedParagraphs,
    changedSections,
    lineSegmentArraysRemoved,
    changedParagraphLineSegmentsRemaining,
    ...preview,
  }
}
