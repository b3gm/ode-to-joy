import { ABType } from "./array-backed-types/ab-type";
import { unknownEnumValue } from "./array-backed-types/utils";
import { ExplicitSolver } from "./explicit-solvers";

export type GenericExplicitSolver<T> =
  (fDash: (current: T) => T) =>
  (current: T) => 
  (stepSize: number) => T;

export interface FloatArrayImplementation<A> {
  /**
   * Constructor for a custom array type to hold floats.
   * @param size custom array will be expected to hold this amount of floats.
   * @returns the actual array implementation.
   */
  ctor: (size: number) => A;

  /**
   * Method for writing floats into an array.
   * @param arr custom array
   * @param index index to write a value at.
   * @param value value to write.
   * @returns 
   */
  put: (arr: A, index: number, value: number) => void;

  /**
   * Method for reading floats from an array
   * @param arr custom array
   * @param index index to read values from
   * @returns value at index
   */
  get: (arr: A, index: number) => number;

  /**
   * Method for converting the array implementation into a
   * Float64Array. Will be replaced later.
   * @param arr the custom array
   * @returns a Float64Array
   */
  toFloat64Array: (arr: A) => Float64Array;

  /**
   * Method converting a Float64Array into a custom array.
   * @param arr Float64Array
   * @returns custom array
   */
  fromFloat64Array: (arr: Float64Array) => A;
}

const float64ArrayImplementation: FloatArrayImplementation<Float64Array> = {
  ctor: (size) => new Float64Array(size),
  put: (arr, index, value) => arr[index] = value,
  get: (arr, index) => arr[index],
  toFloat64Array: (arr) => arr,
  fromFloat64Array: (arr) => arr
}

export interface GenericExplicitSolverFactoryProperties<T, A = Float64Array> {
  itemType: ABType<T>;
  solver: ExplicitSolver;
  arrayImplementation?: FloatArrayImplementation<A>;
}

const arrayReaderFactory = <A>(get: (arr: A, index: number) => number) =>
  (arr: A) => {
    let index = 0;
    // attention: must be post-increment operator
    return () => get(arr, index++);
  }

const arrayWriterFactory = <A>(put: (arr: A, index: number, value: number) => void) =>
  (arr: A) => {
    let index = 0;
    // attention: must be post-increment operator
    return (value: number) => put(arr, index++, value);
  }

function getSize<T>(value: T, abType: ABType<T>): number {
  const sizeType = abType.abSizeType;
  switch(sizeType) {
  case "FIXED":
    return abType.size;
  case "DYNAMIC":
    return abType.getSize(value);
  default:
    return unknownEnumValue(sizeType);
  }
}

export function createGenericExplicitSolver<T, A = Float64Array>({
  itemType,
  solver,
  // cast should be ok if the user let's A be inferred
  arrayImplementation = float64ArrayImplementation as unknown as FloatArrayImplementation<A>
}: GenericExplicitSolverFactoryProperties<T, A>): GenericExplicitSolver<T> {
  const arrayReader = arrayReaderFactory(arrayImplementation.get);
  const arrayWriter = arrayWriterFactory(arrayImplementation.put);

  return (derivative) => {
    const fDashFactory = (workValue: T) => (current: Float64Array) => {
      const customArray = arrayImplementation.fromFloat64Array(current);
      const reader = arrayReader(customArray);
      const mapped = itemType.applyValues(reader, workValue);
      const derived = derivative(mapped);
      // construct new resultArray so we don't modify current
      // if it's still needed by the solver
      const resultArray = arrayImplementation.ctor(current.length);
      const writer = arrayWriter(resultArray);
      itemType.extractValues(
        derived,
        writer
      );
      return arrayImplementation.toFloat64Array(resultArray);
    }

    return (current: T) => {
      const fDash = fDashFactory(current);
      const arraySize = getSize(current, itemType);
      const customArray = arrayImplementation.ctor(arraySize);
      const writer = arrayWriter(customArray);
      itemType.extractValues(current, writer);
      const array = arrayImplementation.toFloat64Array(customArray);
      
      return (stepSize: number) => {
        const stepResult = solver(array, stepSize, fDash);
        return itemType.applyValues(
          arrayReader(arrayImplementation.fromFloat64Array(stepResult)),
          current
        );
      }
    }
  }

}