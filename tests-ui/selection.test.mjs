import assert from "node:assert/strict";
import { wordBounds } from "../src/ui/selection-range";
const text = "Una palabra de esperanza: más luz 🌙 final";
let range = wordBounds(text, 0, 23);
assert.equal(text.slice(range.start, range.end), "Una palabra de esperanza:");
range = wordBounds(text, 16, 21);
assert.equal(text.slice(range.start, range.end), "esperanza:");
range = wordBounds(text, text.indexOf("🌙") + 1, text.indexOf("🌙") + 1);
assert.equal(text.slice(range.start, range.end), "🌙");
assert.deepEqual(wordBounds("", 0, 0), { start: 0, end: 0 });
console.log(
  "PASS: exclusive UTF-16 endpoints, clipped esperanza repair, word shrink, surrogate pairs.",
);
