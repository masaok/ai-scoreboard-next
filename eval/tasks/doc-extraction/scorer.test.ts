import { makeScorer } from "./scorer";

const score = makeScorer();
const base = { id: "x", prompt: "", document: "" };

test("exact match on all fields passes", () => {
  const r = score({ ...base, expected: { a: "1", b: "2" } }, '{"a":"1","b":"2"}');
  expect(r.passed).toBe(true);
  expect(r.score).toBe(1);
});

test("one wrong field drops below perfect and fails", () => {
  const r = score({ ...base, expected: { a: "1", b: "2", c: "3" } }, '{"a":"1","b":"X","c":"3"}');
  expect(r.passed).toBe(false);
  expect(r.score).toBeCloseTo(0.667, 2);
  expect(r.detail).toContain("b");
});

test("matching ignores case and surrounding whitespace", () => {
  const r = score({ ...base, expected: { name: "Jordan Lee" } }, '{"name":"  jordan lee "}');
  expect(r.passed).toBe(true);
});

test("JSON wrapped in prose/fences is still parsed", () => {
  const r = score({ ...base, expected: { a: "1" } }, 'Here you go:\n```json\n{"a":"1"}\n```');
  expect(r.passed).toBe(true);
});

test("unparseable output scores zero", () => {
  const r = score({ ...base, expected: { a: "1" } }, "sorry, no JSON");
  expect(r.passed).toBe(false);
  expect(r.score).toBe(0);
});
