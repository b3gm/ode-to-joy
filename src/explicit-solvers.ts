import { addAllToFirst, addSelf, scalarMultiply, scalarMultiplySelf } from "./array-operations";

/**
 * See: https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
 */

const oneThird = 1.0 / 3.0;
const oneOverSix = 1.0 / 6.0;

export type ExplicitSolver = (
  current: Float64Array,
  stepSize: number,
  fDash: (current: Float64Array) => Float64Array
) => Float64Array; 

export const explicitEulerMethod: ExplicitSolver = (current, stepSize, fDash) => {
  const k0 = fDash(current);
  return addSelf(scalarMultiplySelf(k0, stepSize), current);
}

export const secondOrderTwoStageMethodFamily: (alpha: number) => ExplicitSolver =
  (alpha) => {
    const b0 = 1 - 0.5 / alpha;
    const b1 = 0.5 / alpha;
    return (current, stepSize, fDash) => {
      const k0 = fDash(current);
      const k1 = fDash(addSelf(scalarMultiply(k0, alpha * stepSize), current));
      return addAllToFirst(
        scalarMultiplySelf(k0, b0 * stepSize),
        scalarMultiplySelf(k1, b1 * stepSize),
        current
      );
    }
  }

export const ralstonMethod = secondOrderTwoStageMethodFamily(2.0 / 3.0);

export const midPointMethod: ExplicitSolver = (current, stepSize, fDash) => {
  const k0 = fDash(current);
  const k1 = fDash(addSelf(scalarMultiplySelf(k0, stepSize * 0.5), current));
  return addSelf(scalarMultiplySelf(k1, stepSize), current);
}

export const heunMethod: ExplicitSolver = (current, stepSize, fDash) => {
  const k0 = fDash(current);
  const k1 = fDash(addSelf(scalarMultiply(k0, stepSize), current));
  return addSelf(scalarMultiplySelf(addSelf(k0, k1), 0.5 * stepSize), current);
}

export const rungeKutta4: ExplicitSolver = (current, stepSize, fDash) => {
  const halfStepSize = stepSize * 0.5;
  const stepSizeBySix = stepSize * oneOverSix;
  const stepSizeByThree = stepSize * oneThird;
  const k0 = fDash(current);
  const k1 = fDash(addSelf(scalarMultiply(k0, halfStepSize), current));
  const k2 = fDash(addSelf(scalarMultiply(k1, halfStepSize), current));
  const k3 = fDash(addSelf(scalarMultiply(k2, stepSize), current));
  return addAllToFirst(
    scalarMultiplySelf(k0, stepSizeBySix),
    scalarMultiplySelf(k1, stepSizeByThree),
    scalarMultiplySelf(k2, stepSizeByThree),
    scalarMultiplySelf(k3, stepSizeBySix),
    current
  )
}

export const rungeKuttaThreeEightsRule: ExplicitSolver = (current, stepSize, fDash) => {
  const stepSizeOverThree = stepSize * oneThird;
  const k0 = fDash(current);
  const k1 = fDash(addSelf(scalarMultiply(k0, stepSizeOverThree), current));
  const k2 = fDash(
    addAllToFirst(
      scalarMultiply(k0, - stepSizeOverThree),
      scalarMultiply(k1, stepSize),
      current
    )
  );
  const k3 = fDash(
    addAllToFirst(
      scalarMultiply(k0, stepSize),
      scalarMultiply(k1, - stepSize),
      scalarMultiply(k2, stepSize),
      current
    )
  );
  return addAllToFirst(
    scalarMultiplySelf(k0, stepSize / 8.0),
    scalarMultiplySelf(k1, stepSize * 3.0 / 8.0),
    scalarMultiplySelf(k2, stepSize * 3.0 / 8.0),
    scalarMultiplySelf(k3, stepSize / 8.0),
    current
  )
}