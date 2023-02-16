import { Prng } from "./rng";

describe(Prng, () => {
  it("should have a sufficiently high period", () => {
    const foundNumbers: number[] = [];
    const numberSet = new Set<number>();
    const rng = new Prng(753245);
    let min = 1.0;
    let max = 0.0;
    const buckets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i != 10000; ++i) {
      const next = rng.nextDouble();
      max = Math.max(max, next);
      min = Math.min(min, next);
      expect(next).toBeGreaterThanOrEqual(0.0);
      expect(next).toBeLessThan(1.0);
      expect(numberSet.has(next)).toBe(false);
      numberSet.add(next);
      foundNumbers.push(next);
      buckets[Math.floor(next * 10.0)] += 1;
    }
    expect(min).toBeLessThan(1.0e-3);
    expect(max).toBeGreaterThan(0.999);
  });
});