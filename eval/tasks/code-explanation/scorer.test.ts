import { makeScorer } from "./scorer";

const score = makeScorer();

test("full keyword coverage passes", () => {
  const r = score({ id: "x", prompt: "", keywords: ["reverse", "string"] }, "It reverses the string.");
  expect(r.passed).toBe(true);
  expect(r.score).toBe(1);
});

test("coverage below 70% fails", () => {
  const r = score(
    { id: "x", prompt: "", keywords: ["memo", "cache", "closure"] },
    "It uses a memo and a cache.",
  );
  expect(r.passed).toBe(false);
  expect(r.score).toBeCloseTo(0.667, 2);
  expect(r.detail).toContain("closure");
});

test("matching is case-insensitive", () => {
  const r = score({ id: "x", prompt: "", keywords: ["Binary", "Sorted"] }, "binary search on a SORTED array");
  expect(r.passed).toBe(true);
});
