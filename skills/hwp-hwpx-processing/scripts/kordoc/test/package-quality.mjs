import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import JSZip from "jszip"
import { renderTemplateFromMarkdown, writeFromMarkdown } from "../src/core.mjs"

async function zipEntryNames(filePath) {
  const zip = await JSZip.loadAsync(await readFile(filePath))
  return Object.keys(zip.files).sort()
}

function parseStableVersion(value) {
  const match = String(value).match(/^(\d+)\.(\d+)\.(\d+)$/)
  return match ? match.slice(1).map((part) => Number.parseInt(part, 10)) : null
}

function versionAtLeast(actual, minimum) {
  const actualParts = parseStableVersion(actual)
  const minimumParts = parseStableVersion(minimum)
  if (!actualParts || !minimumParts) return false
  for (let index = 0; index < 3; index += 1) {
    const left = actualParts[index]
    const right = minimumParts[index]
    if (left > right) return true
    if (left < right) return false
  }
  return true
}

test("lockfile keeps security overrides effective for optional transitive packages", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"))
  const lockfile = JSON.parse(await readFile(new URL("../package-lock.json", import.meta.url), "utf8"))

  assert.equal(packageJson.overrides?.["adm-zip"], "^0.6.0")
  assert.equal(packageJson.overrides?.sharp, "^0.35.0")

  const packageEntries = Object.entries(lockfile.packages ?? {})
  const admZipEntries = packageEntries.filter(([packagePath]) => packagePath.endsWith("/adm-zip"))
  const sharpEntries = packageEntries.filter(([packagePath]) => packagePath.endsWith("/sharp"))

  assert.ok(admZipEntries.length > 0, "package-lock.json should contain adm-zip resolution metadata")
  assert.ok(sharpEntries.length > 0, "package-lock.json should contain sharp resolution metadata")

  for (const [packagePath, metadata] of admZipEntries) {
    assert.ok(
      versionAtLeast(metadata.version, "0.6.0"),
      `${packagePath} resolved to ${metadata.version}; expected a stable version >= 0.6.0`,
    )
  }
  for (const [packagePath, metadata] of sharpEntries) {
    assert.ok(
      versionAtLeast(metadata.version, "0.35.0"),
      `${packagePath} resolved to ${metadata.version}; expected a stable version >= 0.35.0`,
    )
  }
})

test("template repacking preserves the existing ZIP entry set", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-package-quality-"))
  try {
    const sourceMd = path.join(root, "template.md")
    const sourceHwpx = path.join(root, "template.hwpx")
    const fieldsMd = path.join(root, "fields.md")
    const outputHwpx = path.join(root, "output.hwpx")

    await writeFile(sourceMd, "{{value}}\n", "utf8")
    await writeFromMarkdown(sourceMd, sourceHwpx)
    const beforeEntries = await zipEntryNames(sourceHwpx)

    await writeFile(fieldsMd, "## value\n치환된 값\n", "utf8")
    await renderTemplateFromMarkdown(sourceHwpx, fieldsMd, outputHwpx)
    const afterEntries = await zipEntryNames(outputHwpx)

    assert.deepEqual(afterEntries, beforeEntries)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("template removes a stale Preview/PrvImage.png after text changes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-preview-quality-"))
  try {
    const sourceMd = path.join(root, "template.md")
    const sourceHwpx = path.join(root, "template.hwpx")
    const sourceWithPreview = path.join(root, "template-with-preview.hwpx")
    const fieldsMd = path.join(root, "fields.md")
    const outputHwpx = path.join(root, "output.hwpx")

    await writeFile(sourceMd, "{{value}}\n", "utf8")
    await writeFromMarkdown(sourceMd, sourceHwpx)

    const sourceZip = await JSZip.loadAsync(await readFile(sourceHwpx))
    sourceZip.file("Preview/PrvImage.png", new Uint8Array([137, 80, 78, 71]), {
      binary: true,
      createFolders: false,
    })
    const sourceBytes = await sourceZip.generateAsync({ type: "uint8array" })
    await writeFile(sourceWithPreview, sourceBytes)

    await writeFile(fieldsMd, "## value\n치환된 값\n", "utf8")
    const result = await renderTemplateFromMarkdown(sourceWithPreview, fieldsMd, outputHwpx)

    assert.equal(result.previewImageRemoved, true)
    assert.equal(result.previewImagePresent, false)

    const outputZip = await JSZip.loadAsync(await readFile(outputHwpx))
    assert.equal(outputZip.file("Preview/PrvImage.png"), null)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
