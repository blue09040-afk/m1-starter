import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { spawn } from "node:child_process"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import test from "node:test"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const cli = path.join(projectRoot, "src", "cli.mjs")

function runCli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], {
      cwd: projectRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    })
    let stdout = ""
    let stderr = ""
    child.stdout.setEncoding("utf8")
    child.stderr.setEncoding("utf8")
    child.stdout.on("data", (chunk) => { stdout += chunk })
    child.stderr.on("data", (chunk) => { stderr += chunk })
    child.on("error", reject)
    child.on("close", (code) => resolve({ code, stdout, stderr }))
  })
}

test("CLI returns machine-readable status for write, analyze, template, extract, validate, and safe fill", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-writing-cli-"))
  try {
    const source = path.join(root, "source.md")
    const output = path.join(root, "output.hwpx")
    const extracted = path.join(root, "extracted.md")
    const templateSource = path.join(root, "template-source.md")
    const templateHwpx = path.join(root, "template.hwpx")
    const fields = path.join(root, "fields.md")
    const templated = path.join(root, "templated.hwpx")
    const templatedExtract = path.join(root, "templated.md")
    const packageJson = JSON.parse(await readFile(path.join(projectRoot, "package.json"), "utf8"))
    await writeFile(source, "# CLI TEST\n\n본문 24680\n", "utf8")

    const writeResult = await runCli(["write", source, "-o", output])
    assert.equal(writeResult.code, 0, writeResult.stderr)
    const writeStatus = JSON.parse(writeResult.stdout)
    assert.equal(writeStatus.ok, true)
    assert.equal(writeStatus.command, "write")
    assert.equal(writeStatus.kordocVersion, packageJson.dependencies.kordoc)

    const extractResult = await runCli(["extract", output, "-o", extracted])
    assert.equal(extractResult.code, 0, extractResult.stderr)
    assert.match(await readFile(extracted, "utf8"), /24680/)

    await writeFile(templateSource, "{{name}}\n\n{{message}}\n", "utf8")
    const templateWrite = await runCli(["write", templateSource, "-o", templateHwpx])
    assert.equal(templateWrite.code, 0, templateWrite.stderr)

    const analyzeResult = await runCli(["analyze", templateHwpx])
    assert.equal(analyzeResult.code, 0, analyzeResult.stderr)
    const analyzeStatus = JSON.parse(analyzeResult.stdout)
    assert.equal(analyzeStatus.ok, true)
    assert.equal(analyzeStatus.command, "analyze")
    assert.deepEqual(analyzeStatus.placeholders, ["message", "name"])
    assert.equal(analyzeStatus.recommendedWorkflow, "template")

    await writeFile(fields, "## name\n테스트 사용자\n\n## message\nCLI 템플릿 97531\n", "utf8")
    const templateResult = await runCli(["template", templateHwpx, fields, "-o", templated])
    assert.equal(templateResult.code, 0, templateResult.stderr)
    const templateStatus = JSON.parse(templateResult.stdout)
    assert.equal(templateStatus.ok, true)
    assert.equal(templateStatus.command, "template")
    assert.equal(templateStatus.fields, 2)
    assert.equal(templateStatus.previewRefreshed, true)

    const templateExtractResult = await runCli(["extract", templated, "-o", templatedExtract])
    assert.equal(templateExtractResult.code, 0, templateExtractResult.stderr)
    assert.match(await readFile(templatedExtract, "utf8"), /CLI 템플릿 97531/)

    const validateResult = await runCli(["validate", templated])
    assert.equal(validateResult.code, 0, validateResult.stderr)
    const validateStatus = JSON.parse(validateResult.stdout)
    assert.equal(validateStatus.ok, true)
    assert.equal(validateStatus.command, "validate")

    const labelSource = path.join(root, "label-form.md")
    const labelHwpx = path.join(root, "label-form.hwpx")
    const labelValues = path.join(root, "label-values.json")
    const labelBlocked = path.join(root, "label-blocked.hwpx")
    const labelAllowed = path.join(root, "label-allowed.hwpx")
    await writeFile(labelSource, "| 항목 | 내용 |\n| --- | --- |\n| 성명 |  |\n", "utf8")
    const labelWrite = await runCli(["write", labelSource, "-o", labelHwpx])
    assert.equal(labelWrite.code, 0, labelWrite.stderr)
    await writeFile(labelValues, JSON.stringify({ 성명: "CLI 라벨 검증" }), "utf8")

    const blockedFill = await runCli(["fill", labelHwpx, labelValues, "-o", labelBlocked])
    assert.equal(blockedFill.code, 2)
    const blockedStatus = JSON.parse(blockedFill.stderr)
    assert.equal(blockedStatus.reviewRequired, true)
    assert.match(blockedStatus.error, /--allow-label-fill/)
    await assert.rejects(readFile(labelBlocked), (error) => error?.code === "ENOENT")

    const allowedFill = await runCli([
      "fill", labelHwpx, labelValues, "-o", labelAllowed, "--allow-label-fill",
    ])
    assert.equal(allowedFill.code, 0, allowedFill.stderr)
    const allowedStatus = JSON.parse(allowedFill.stdout)
    assert.equal(allowedStatus.fillMode, "label-heuristic")
    assert.equal(allowedStatus.visualReviewRequired, true)
    assert.equal(allowedStatus.labelFillRequestedCount, 1)

    const overwriteResult = await runCli(["write", source, "-o", output])
    assert.equal(overwriteResult.code, 1)
    const overwriteStatus = JSON.parse(overwriteResult.stderr)
    assert.equal(overwriteStatus.ok, false)
    assert.equal(overwriteStatus.reviewRequired, false)
    assert.match(overwriteStatus.error, /Output already exists/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
