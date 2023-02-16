import { ABType } from "./ab-type";

export type ABObjectDescription<T, K extends keyof T> = {[P in K]: ABType<T[P]>};

export interface ABObjectProperty<T, K extends keyof T> {
  key: K;
  abType: ABType<T[K]>;
}

export function object<T, K extends keyof T>(props: ABObjectDescription<T, K>): ABType<T> {
  let size = 0;
  const properties: ABObjectProperty<T, K>[] = [];
  for (let key in props) {
    const abType = props[key];
    size += abType.size;
    const property = { key, abType };
    properties.push(property);
  }
  return new ABObject(properties, size);
}

class ABObject<T, K extends keyof T> implements ABType<T> {

  constructor(
    private readonly properties: ABObjectProperty<T, K>[],
    public readonly size: number
  ) {
  }

  extractValues(value: T, arr: Float64Array): void {
    let index = 0;
    for (const {key, abType} of this.properties) {
      const nextIndex = index + abType.size;
      const propertyValue = value[key];
      abType.extractValues(propertyValue, arr.subarray(index, nextIndex));
      index = nextIndex;
    }
  }

  applyValues(arr: Float64Array, value: T): T {
    let index = 0;
    for (const {key, abType} of this.properties) {
      let nextIndex = index + abType.size;
      const appliedValue = abType.applyValues(
        arr.subarray(index, nextIndex),
        value[key]
      );
      value[key] = appliedValue;
      index = nextIndex
    }
    return value;
  }

}