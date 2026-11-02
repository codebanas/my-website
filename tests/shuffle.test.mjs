import assert from "node:assert/strict";
import { test } from "node:test";
import { shuffle, shuffleWithFavorites } from "../lib/shuffle.ts";

test("shuffle preserves every card without mutating the source", () => {
  const cards = ["a", "b", "c", "d"];
  const shuffled = shuffle(cards, () => 0);
  assert.deepEqual(cards, ["a", "b", "c", "d"]);
  assert.deepEqual([...shuffled].sort(), cards);
  assert.notDeepEqual(shuffled, cards);
});

test("grouped shuffle keeps every saved and unsaved card, with saved cards adjacent", () => {
  const cards = Array.from({ length: 8 }, (_, index) => ({ id: String(index) }));
  const saved = new Set(["1", "4", "6"]);

  for (let seed = 1; seed <= 100; seed++) {
    let state = seed;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 2 ** 32;
    };
    const result = shuffleWithFavorites(cards, saved, random);
    assert.equal(result.length, cards.length);
    assert.deepEqual(result.map((card) => card.id).sort(), cards.map((card) => card.id).sort());
    const positions = result.flatMap((card, index) => saved.has(card.id) ? [index] : []);
    assert.equal(positions.at(-1) - positions[0], saved.size - 1);
    assert.notDeepEqual(result, cards);
  }

  assert.deepEqual(cards.map((card) => card.id), ["0", "1", "2", "3", "4", "5", "6", "7"]);
});

test("grouped shuffle handles no saves, all saves, one saved card, and stale saved IDs", () => {
  const cards = [{ id: "a" }, { id: "b" }, { id: "c" }];
  for (const saved of [new Set(), new Set(["a", "b", "c"]), new Set(["b"]), new Set(["missing"])]) {
    const result = shuffleWithFavorites(cards, saved, () => 0.999);
    assert.deepEqual(result.map((card) => card.id).sort(), ["a", "b", "c"]);
    assert.notDeepEqual(result, cards);
  }
  assert.deepEqual(shuffleWithFavorites([], new Set()), []);
  assert.deepEqual(shuffleWithFavorites([cards[0]], new Set(["a"])), [cards[0]]);
});

test("a saved group moves if a draw would otherwise leave the same order", () => {
  const cards = [{ id: "a" }, { id: "b" }];
  const result = shuffleWithFavorites(cards, new Set(["a"]), () => 0);
  assert.deepEqual(result.map((card) => card.id), ["b", "a"]);
});

test("shuffle always changes an unchanged draw when multiple cards exist", () => {
  const cards = ["a", "b", "c"];
  assert.notDeepEqual(shuffle(cards, () => 0.999), cards);
  assert.deepEqual(shuffle([]), []);
  assert.deepEqual(shuffle(["a"]), ["a"]);
});
