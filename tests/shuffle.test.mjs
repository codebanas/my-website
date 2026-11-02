import assert from "node:assert/strict";
import { test } from "node:test";
import { shuffle } from "../lib/shuffle.ts";

test("shuffle preserves every card without mutating the source", () => {
  const cards = ["a", "b", "c", "d"];
  const shuffled = shuffle(cards, () => 0);
  assert.deepEqual(cards, ["a", "b", "c", "d"]);
  assert.deepEqual([...shuffled].sort(), cards);
  assert.notDeepEqual(shuffled, cards);
});

test("shuffle always changes an unchanged draw when multiple cards exist", () => {
  const cards = ["a", "b", "c"];
  assert.notDeepEqual(shuffle(cards, () => 0.999), cards);
  assert.deepEqual(shuffle([]), []);
  assert.deepEqual(shuffle(["a"]), ["a"]);
});
