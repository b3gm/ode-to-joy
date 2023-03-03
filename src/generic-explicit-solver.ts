import { ABType } from "./array-backed-types/ab-type";
import { ExplicitSolver } from "./explicit-solvers";

export interface GenericExplicitSolver<T> {
  (current: T, stepSize: number, fDash: (current: T) => T): T;
}

export function createGenericExplicitSolver<T>(
  description: ABType<T>,
  solver: ExplicitSolver
): GenericExplicitSolver<T> {

  return (current: T, stepSize: number, derivative: (current: T) => T) => {
    const fDash = (arr: Float64Array) => {
      const mapped = description.applyValues(arr, current);
      const derived = derivative(mapped);
      const result = new Float64Array(description.size);
      description.extractValues(
        derived,
        result
      );
      return result;
    }
    const array = new Float64Array(description.size);
    description.extractValues(current, array);
    const stepResult = solver(array, stepSize, fDash);
    return description.applyValues(stepResult, current);
  }

}