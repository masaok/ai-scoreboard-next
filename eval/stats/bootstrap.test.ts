import { mean, stdev, bootstrapCI } from "./bootstrap";

test("mean and stdev", () => {
  expect(mean([1, 1, 1])).toBe(1);
  expect(mean([0, 1])).toBe(0.5);
  expect(mean([])).toBe(0);
  expect(stdev([2, 2, 2])).toBe(0);
  expect(stdev([1, 3])).toBeCloseTo(1.4142, 3);
});

test("all-ones gives a tight interval at 1", () => {
  const ci = bootstrapCI([1, 1, 1, 1]);
  expect(ci.mean).toBe(1);
  expect(ci.lo).toBe(1);
  expect(ci.hi).toBe(1);
  expect(ci.n).toBe(4);
});

test("seeded bootstrap is deterministic and brackets the mean", () => {
  const a = bootstrapCI([1, 0, 1, 0, 1, 0]);
  const b = bootstrapCI([1, 0, 1, 0, 1, 0]);
  expect(a).toEqual(b); // reproducible -> stable committed results
  expect(a.lo).toBeLessThan(a.mean);
  expect(a.hi).toBeGreaterThan(a.mean);
});

test("empty input is all zeros", () => {
  expect(bootstrapCI([])).toEqual({ mean: 0, lo: 0, hi: 0, stdev: 0, n: 0 });
});
