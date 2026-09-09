import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { renderHwpxToSvg } from "kordoc"
import {
  collectSources,
  extractToMarkdown,
  validateFile,
  writeFromMarkdown,
} from "../src/core.mjs"

test("collect keeps duplicate basenames distinguishable and supports synthesis-to-HWPX flow", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hwpx-multi-flow-"))
  try {
    const aDir = path.join(root, "a")
    const bDir = path.join(root, "b")
    await mkdir(aDir)
    await mkdir(bDir)

    const first = path.join(aDir, "same.md")
    const second = path.join(bDir, "same.md")
    const sourceMd = path.join(root, "source.md")
    const sourceHwpx = path.join(root, "source.hwpx")
    const collected = path.join(root, "collected.md")
    const finalMd = path.join(root, "final.md")
    const finalHwpx = path.join(root, "final.hwpx")
    const finalExtract = path.join(root, "final-extract.md")

    await writeFile(first, "첫 번째 공개자료: 예산 100\n", "utf8")
    await writeFile(second, "두 번째 공개자료: 일정 2026-09-01\n", "utf8")
    await writeFile(sourceMd, "세 번째 공개자료: 담당부서 기획팀\n", "utf8")
    await writeFromMarkdown(sourceMd, sourceHwpx)

    const result = await collectSources([first, second, sourceHwpx], collected)
    assert.equal(result.sources, 3)

    const material = await readFile(collected, "utf8")
    assert.match(material, /HWPX-WRITING-SOURCE 1: same\.md/)
    assert.match(material, /HWPX-WRITING-SOURCE 2: same\.md/)
    assert.match(material, /HWPX-WRITING-SOURCE 3: source\.hwpx/)
    assert.match(material, /첫 번째 공개자료: 예산 100/)
    assert.match(material, /두 번째 공개자료: 일정 2026-09-01/)
    assert.match(material, /세 번째 공개자료: 담당부서 기획팀/)

    // 실제 Chat/LLM 단계는 의미 취합을 수행한다. CI에서는 동일 입출력 계약을
    // 결정론적으로 검증하기 위해 알려진 세 입력의 취합 결과를 직접 작성한다.
    await writeFile(
      finalMd,
      "# 공개자료 취합 결과\n\n- 예산: 100\n- 일정: 2026-09-01\n- 담당부서: 기획팀\n",
      "utf8",
    )
    await writeFromMarkdown(finalMd, finalHwpx, { preset: "report" })
    assert.equal((await validateFile(finalHwpx)).ok, true)

    const rendered = await renderHwpxToSvg(new Uint8Array(await readFile(finalHwpx)), { reflow: true })
    assert.ok(rendered.pageCount >= 1)
    assert.ok(rendered.svg.includes("<svg"))

    await extractToMarkdown(finalHwpx, finalExtract)
    const extracted = await readFile(finalExtract, "utf8")
    assert.match(extracted, /공개자료 취합 결과/)
    assert.match(extracted, /예산: 100/)
    assert.match(extracted, /일정: 2026-09-01/)
    assert.match(extracted, /담당부서: 기획팀/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
