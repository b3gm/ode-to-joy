export interface ABType<T> {

  readonly size: number;
  
  extractValues(value: T, arr: Float64Array): void;

  /**
   * Returns a value updated with floats from the array and may apply them
   * into the value directly.
   * 
   * @param arr array of floats to read data from
   * @param value value to apply the data to.
   * @returns tuple of new array index which is supposed to be 1 after the last
   * index read from the array and the updated value.
   */
  applyValues(arr: Float64Array, value: T): T;

}