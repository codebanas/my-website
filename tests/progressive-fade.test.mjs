import assert from "node:assert/strict";
import { test } from "node:test";
import { getProgressiveFade } from "../lib/progressive-fade.ts";

test("top and side fades retain their independent darkness strengths", () => {
  assert.equal(getProgressiveFade("top", 6).backgroundImage.match(/linear-gradient/g).length, 6);
  for (const edge of ["left", "right"]) {
    assert.equal(getProgressiveFade(edge, 2).backgroundImage.match(/linear-gradient/g).length, 2);
  }
});

test("blur begins at 16px and tapers to an unblurred transparent inner edge", () => {
  for (const edge of ["top", "left", "right"]) {
    const { blurLayers } = getProgressiveFade(edge, 2);
    assert.deepEqual(blurLayers.map((layer) => layer.radius), [16, 14, 12, 10, 8, 6, 4, 2]);
    assert.ok(blurLayers[0].maskImage.includes("#000 0%"));
    assert.ok(blurLayers.at(-1).maskImage.endsWith("transparent 100%)"));
    assert.ok(getProgressiveFade(edge, 2).backgroundImage.includes("rgb(13 13 13 / 0%) 100%"));
  }
});

test("horizontal fades mirror each other while sharing the same blur range", () => {
  const left = getProgressiveFade("left", 2);
  const right = getProgressiveFade("right", 2);
  assert.ok(left.blurLayers.every((layer) => layer.maskImage.startsWith("linear-gradient(to right,")));
  assert.ok(right.blurLayers.every((layer) => layer.maskImage.startsWith("linear-gradient(to left,")));
  assert.deepEqual(left.blurLayers.map((layer) => layer.radius), right.blurLayers.map((layer) => layer.radius));
});
