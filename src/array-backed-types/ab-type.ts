export interface IABType<T> {
  readonly abSizeType: string;
  
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

export interface ABFixedSizeType<T> extends IABType<T> {
  readonly abSizeType: "FIXED";
  readonly size: number;
}

export abstract class BaseABFixedSizeType<T> implements ABFixedSizeType<T> {
  readonly abSizeType = "FIXED";
  constructor(public readonly size: number) {
  }

  public abstract applyValues(arr: Float64Array, value: T): T;
  public abstract extractValues(value: T, arr: Float64Array): void;
}

export interface ABDynamicSizeType<T> extends IABType<T> {
  readonly abSizeType: "DYNAMIC";
  getSize(value: T): number;
}

export abstract class BaseABDynamicSizeType<T> implements ABDynamicSizeType<T> {
  readonly abSizeType = "DYNAMIC";
  constructor() {
  }

  public abstract getSize(value: T): number;
  public abstract applyValues(arr: Float64Array, value: T): T;
  public abstract extractValues(value: T, arr: Float64Array): void;
}

export type ABType<T> = ABFixedSizeType<T> | ABDynamicSizeType<T>;