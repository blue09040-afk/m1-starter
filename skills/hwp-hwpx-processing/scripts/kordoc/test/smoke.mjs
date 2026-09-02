import test from "node:test"
import assert from "node:assert/strict"
import { VERSION as KORDOC_VERSION } from "kordoc"
import { EXPECTED_KORDOC_VERSION } from "../src/core.mjs"
import { parsePrepareMap } from "../src/template-prep.mjs"
import { parseTemplateMarkdown } from "../src/hwpx-package.mjs"

test("Kordoc exact pin matches runtime",()=>assert.equal(KORDOC_VERSION,EXPECTED_KORDOC_VERSION))
test("prepare map accepts unique literals",()=>assert.equal(parsePrepareMap({name:"OLD NAME"}).get("name"),"OLD NAME"))
test("template markdown parses fields",()=>assert.equal(parseTemplateMarkdown("## name\n홍길동\n").get("name"),"홍길동"))
