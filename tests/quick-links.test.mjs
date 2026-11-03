import test from "node:test";
import assert from "node:assert/strict";
import { getQuickLinkCueState, getQuickLinkWindow, hasReachedPageEnd, quickLinks } from "../lib/quick-links.ts";

test("the initial window preserves the original three links", () => {
  const { start, end } = getQuickLinkWindow(0, quickLinks.length);
  assert.deepEqual(quickLinks.slice(start, end), ["Home", "How It Works?", "Buy Me a Coffee"]);
});

test("scrolling brings new links in as previous links leave the three-row window", () => {
  const { start, end } = getQuickLinkWindow(2, quickLinks.length);
  assert.deepEqual(quickLinks.slice(start, end), ["How It Works?", "Buy Me a Coffee", "Community"]);
  assert.ok(!quickLinks.slice(start, end).includes("Home"));
});

test("every active link stays visible without empty rows at either end", () => {
  for (let active = 0; active < quickLinks.length; active++) {
    const { start, end } = getQuickLinkWindow(active, quickLinks.length);
    assert.equal(end - start, 3);
    assert.ok(start <= active && active < end);
    assert.ok(start >= 0 && end <= quickLinks.length);
  }
  const { start, end } = getQuickLinkWindow(quickLinks.length - 1, quickLinks.length);
  assert.deepEqual(quickLinks.slice(start, end), ["Supporter Stories", "FAQs", "Contact"]);
});

test("the quick-links final screen starts only at the end of page scrolling", () => {
  assert.equal(hasReachedPageEnd(0, 1500, 900), false);
  assert.equal(hasReachedPageEnd(400, 1500, 900), false);
  assert.equal(hasReachedPageEnd(598, 1500, 900), false);
  assert.equal(hasReachedPageEnd(599.5, 1500, 900), true);
  assert.equal(hasReachedPageEnd(600, 1500, 900), true);
});

test("the scene updates for resized and non-scrolling viewports", () => {
  assert.equal(hasReachedPageEnd(600, 1600, 900), false);
  assert.equal(hasReachedPageEnd(700, 1600, 900), true);
  assert.equal(hasReachedPageEnd(0, 900, 900), true);
});

test("the cue draws while scrolling, retracts at the terms, and returns when scrolling up", () => {
  const layout = { scrollHeight: 1500, viewportHeight: 900, cueBottom: 1100 };
  assert.deepEqual(getQuickLinkCueState({ ...layout, scrollTop: 0 }), { progress: 0, atEnd: false });
  assert.deepEqual(getQuickLinkCueState({ ...layout, scrollTop: 280 }), { progress: 0.5, atEnd: false });
  assert.deepEqual(getQuickLinkCueState({ ...layout, scrollTop: 500 }), { progress: 1, atEnd: false });
  assert.deepEqual(getQuickLinkCueState({ ...layout, scrollTop: 600 }), { progress: 0, atEnd: true });
  assert.deepEqual(getQuickLinkCueState({ ...layout, scrollTop: 500 }), { progress: 1, atEnd: false });
});

test("cue completion follows resized layouts and handles overscroll", () => {
  const layout = { scrollHeight: 1500, viewportHeight: 900, cueBottom: 1100, scrollTop: 600 };
  assert.equal(getQuickLinkCueState(layout).atEnd, true);
  assert.equal(getQuickLinkCueState({ ...layout, scrollHeight: 1600 }).atEnd, false);
  assert.deepEqual(getQuickLinkCueState({ ...layout, scrollTop: 620 }), { progress: 0, atEnd: true });
  assert.deepEqual(getQuickLinkCueState({ ...layout, scrollHeight: 900, scrollTop: 0 }), { progress: 0, atEnd: false });
});

test("reduced motion keeps a static cue until the back-to-top option replaces it", () => {
  const layout = { scrollHeight: 1500, viewportHeight: 900, cueBottom: 1100, reducedMotion: true };
  assert.deepEqual(getQuickLinkCueState({ ...layout, scrollTop: 280 }), { progress: 1, atEnd: false });
  assert.deepEqual(getQuickLinkCueState({ ...layout, scrollTop: 600 }), { progress: 0, atEnd: true });
});
