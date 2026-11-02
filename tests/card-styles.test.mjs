import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";
import { CARD_COLORS, CARD_TEXTURES, getCardAppearance, getCardColor } from "../lib/card-styles.ts";

test("record styles are repeatable and survive JSON storage", () => {
  const original = getCardAppearance("record-42", 42);
  assert.deepEqual(getCardAppearance("record-42", 42), original);
  assert.deepEqual(JSON.parse(JSON.stringify(original)), original);
  assert.deepEqual(getCardAppearance(42, 42), getCardAppearance("42", 42));
});

test("colors match the reference and cycle continuously to the left and right", () => {
  const order = ["orange", "blue", "green", "pink", "yellow", "purple", "teal"];
  assert.deepEqual(CARD_COLORS, order);
  assert.deepEqual(Array.from({ length: 14 }, (_, index) => getCardColor(index)), [...order, ...order]);
  assert.deepEqual(Array.from({ length: 9 }, (_, index) => getCardColor(index - 2)), ["purple", "teal", ...order]);
  assert.equal(getCardColor(-7), "orange");
  assert.equal(getCardColor(-8), "teal");
});

test("prepending or appending pages preserves the colors of existing cards", () => {
  const original = Array.from({ length: 7 }, (_, index) => getCardColor(index));
  const extended = Array.from({ length: 15 }, (_, index) => getCardColor(-3 + index));
  assert.deepEqual(extended.slice(3, 10), original);

  const before = getCardAppearance("same-record", 0);
  const moved = getCardAppearance("same-record", 1);
  assert.notEqual(before.color, moved.color);
  assert.deepEqual(before.texture, moved.texture);
  assert.equal(before.blendMode, moved.blendMode);
});

test("invalid slider positions cannot produce an undefined color", () => {
  for (const position of [NaN, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => getCardColor(position), /safe integer/);
  }
});

test("styles cover the palette and textures using a single allowed blend mode", () => {
  const colors = new Set();
  const textures = new Set();
  const blends = new Set();
  const modesByTexture = new Map(CARD_TEXTURES.map((texture) => [texture.src, new Set()]));

  for (let index = 0; index < 1000; index++) {
    const appearance = getCardAppearance(`record-${index}`, index);
    assert.ok(CARD_COLORS.includes(appearance.color));
    assert.ok(appearance.texture.blendModes.includes(appearance.blendMode));
    assert.equal(typeof appearance.blendMode, "string");
    colors.add(appearance.color);
    textures.add(appearance.texture.src);
    blends.add(appearance.blendMode);
    modesByTexture.get(appearance.texture.src).add(appearance.blendMode);
  }

  assert.equal(colors.size, CARD_COLORS.length);
  assert.equal(textures.size, CARD_TEXTURES.length);
  assert.deepEqual([...blends].sort(), ["difference", "exclusion", "lighten", "screen"]);
  for (const texture of CARD_TEXTURES) {
    assert.deepEqual([...modesByTexture.get(texture.src)].sort(), [...texture.blendModes].sort());
  }
});

test("filename alternatives normalize to valid CSS and every texture exists", async () => {
  const differenceTexture = CARD_TEXTURES.find((texture) => texture.fileName.startsWith("differences"));
  assert.deepEqual(differenceTexture.blendModes, ["difference", "lighten"]);

  for (const texture of CARD_TEXTURES) {
    const fileUrl = new URL(`../public${texture.src}`, import.meta.url);
    await access(fileUrl);
  }

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const color of CARD_COLORS) {
    assert.ok(css.includes(`--card-${color}:`));
  }
});
