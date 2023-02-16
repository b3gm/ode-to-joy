import { ABType } from "./ab-type";

export function array<T>(abType: ABType<T>, length: number): ABType<T[]> {
  return new ABArray(abType, length);
}

class ABArray<T> implements ABType<T[]> {

  public readonly size;

  constructor(private readonly itemType: ABType<T>, private readonly length: number) {
    this.size = length * itemType.size;
  }

  extractValues(value: T[], arr: Float64Array): void {
    if (value.length !== this.length) {
      throw new Error(
        `Expected array of length ${this.length}, got array of length ${value.length} instead.`
      );
    }
    const itemType = this.itemType;
    for (const item of value) {
      itemType.extractValues(item, arr);
    }
  }

  applyValues(arr: Float64Array, value: T[]): T[] {
    const itemType = this.itemType;
    let index = 0;
    for (let i = 0; i != value.length; ++i) {
      const nextIndex = index + itemType.size;
      const currentValue = value[i];
      const appliedValue = itemType.applyValues(arr.subarray(index, nextIndex), currentValue);
      value[i] = appliedValue;
      index = nextIndex;
    }
    return value;
  }

  get isDynamicSized(): boolean {
    return false;
  }

}