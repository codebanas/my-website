import test from "node:test";
import assert from "node:assert/strict";
import { getScrollFadeOpacity } from "../lib/scroll-fade.ts";

test("each marked row starts fully visible and reaches 25% at the 32px marker", () => {
  for (const initialTop of [160, 213.2, 290, 480]) {
    assert.equal(getScrollFadeOpacity(initialTop, initialTop), 1);
    assert.equal(getScrollFadeOpacity(32, initialTop), 0.25);
    assert.equal(getScrollFadeOpacity((initialTop + 32) / 2, initialTop), 0.625);
  }
});

test("opacity never drops below 25%, including after a row leaves the screen", () => {
  for (const top of [32, 20, 0, -100, -1000]) {
    assert.equal(getScrollFadeOpacity(top, 160), 0.25);
  }
  assert.equal(getScrollFadeOpacity(300, 160), 1);
});

test("rows fade independently from their own starting position", () => {
  const scrollY = 64;
  assert.equal(getScrollFadeOpacity(160 - scrollY, 160), 0.625);
  assert.equal(getScrollFadeOpacity(288 - scrollY, 288), 0.8125);
});

test("scrolling back restores opacity without changing the starting point", () => {
  const scrollPositions = [0, 64, 128, 300, 128, 64, 0];
  assert.deepEqual(scrollPositions.map((scrollY) => getScrollFadeOpacity(160 - scrollY, 160)),
    [1, 0.625, 0.25, 0.25, 0.25, 0.625, 1]);
});
