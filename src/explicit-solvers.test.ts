import {
  explicitEulerMethod,
  ExplicitSolver,
  heunMethod,
  midPointMethod,
  ralstonMethod,
  rungeKutta4,
  rungeKuttaThreeEightsRule
} from "./explicit-solvers";

import * as explicitSolvers from "./explicit-solvers";

const solvers: {name: string, solver: ExplicitSolver, maxDeviation: number}[] = [
  {name: "Explicit Euler", solver: explicitEulerMethod, maxDeviation: 0.3},
  {name: "Heun", solver: heunMethod, maxDeviation: 0.0015},
  {name: "Mid point method", solver: midPointMethod, maxDeviation: 0.0015},
  {name: "Ralston method", solver: ralstonMethod, maxDeviation: 0.0015},
  {name: "Runge Kutta 4", solver: rungeKutta4, maxDeviation: 1.5e-7},
  {name: "Runge Kutta 3/8 rule", solver: rungeKuttaThreeEightsRule, maxDeviation: 1.5e-7}
];

function testDerivative(current: Float64Array) {
  const result = new Float64Array(1);
  result[0] = current[0];
  return result;
}

function integrate(
  fDash: (arr: Float64Array) => Float64Array,
  solver: ExplicitSolver,
  start: number,
  end: number,
  stepSize: number
) {
  let current = new Float64Array(1);
  current[0] = 1;
  for (let x = start; x <= end; x += stepSize) {
    current = solver(current, stepSize, fDash);
  }
  return current;
}

const e = Math.exp(1);
for (const {name, solver, maxDeviation} of solvers) {
  describe(name, () => {
    it("integrates test function", () => {
      const result = integrate(testDerivative, solver, 0.0, 1.0, 0.05);
      const actualValue = result[0];
      // explicit solvers will always underestimate the real value
      expect(actualValue).toBeLessThanOrEqual(e);
      expect(actualValue).toBeGreaterThanOrEqual(e - maxDeviation);
    });
  });
}

describe("README example", () => {
  it ("should yield correct solution", () => {
    let current = new Float64Array(1);
    current[0] = 1;
    for (let i = 0; i != 100; ++i) {
      current = explicitSolvers.rungeKutta4(
        current,
        0.01,
        v => v // fDash: y' = y
      );
    }
    console.log("Solution:", current[0]); // 2.718281828234403

    expect(current[0]).toBeCloseTo(2.718281828, 1.0e-8);
  });
})