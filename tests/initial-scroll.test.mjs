import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { readFile } from "node:fs/promises";
import { initialScrollScript } from "../lib/initial-scroll.ts";

function run(type, hash = "") {
  const scrolls = [];
  const history = { scrollRestoration: "auto" };
  runInNewContext(initialScrollScript, {
    performance: { getEntriesByType: () => type ? [{ type }] : [] },
    location: { hash },
    history,
    window: { scrollTo: (options) => scrolls.push({ ...options }) },
  });
  return { scrolls, history };
}

for (const type of ["navigate", "reload", undefined]) {
  test(`${type ?? "missing navigation timing"} starts at the top instead of restoring the footer`, () => {
    const result = run(type);
    assert.equal(result.history.scrollRestoration, "manual");
    assert.equal(result.scrolls.length, 1);
    assert.equal(result.scrolls[0].top, 0);
    assert.equal(result.scrolls[0].left, 0);
    assert.equal(result.scrolls[0].behavior, "instant");
  });
}

test("back/forward navigation and intentional anchors retain native restoration", () => {
  for (const [type, hash] of [["back_forward", ""], ["navigate", "#gallery-title"]]) {
    const result = run(type, hash);
    assert.equal(result.history.scrollRestoration, "auto");
    assert.equal(result.scrolls.length, 0);
  }
});

test("page layout changes cannot re-snap the document to quick links", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const documentRule = css.match(/\nhtml \{([^}]+)\}/)[1];
  const finalSectionRule = css.match(/\.quick-links-sticky-track \{([^}]+)\}/)[1];
  assert.doesNotMatch(documentRule, /scroll-snap-type/);
  assert.doesNotMatch(finalSectionRule, /scroll-snap-align|scroll-snap-stop/);
});
