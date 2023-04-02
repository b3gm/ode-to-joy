import { ABObjectDescription, ABFixedSizeObjectProperty, ABDynamicSizeObjectProperty } from "./ab-object-description";
import { ABType, BaseABDynamicSizeType, BaseABFixedSizeType } from "./ab-type";


export function object<
  T
>(props: ABObjectDescription<T>): ABType<T> {
  let fixedSize = 0;
  const fixedProperties: ABFixedSizeObjectProperty<T, keyof T>[] = [];
  const dynamicProperties: ABDynamicSizeObjectProperty<T, keyof T>[] = [];
  for (let key in props) {
    const abType = props[key];
    if (abType !== undefined) {
      switch(abType.abSizeType) {
      case "FIXED":
        fixedProperties.push({key, abType} as ABFixedSizeObjectProperty<T, keyof T>);
        fixedSize += abType.size;
        break;
      case "DYNAMIC":
        dynamicProperties.push({key, abType} as ABDynamicSizeObjectProperty<T, keyof T>);
        break;
      }
    }
  }
  if (dynamicProperties.length === 0) {
    return new ABFixedSizeObject(fixedProperties, fixedSize);
  }
  return new ABDynamicSizeObject(fixedProperties, fixedSize, dynamicProperties);
}

class ABFixedSizeObject<T, K extends keyof T> extends BaseABFixedSizeType<T> {
  constructor(
    private readonly properties: ABFixedSizeObjectProperty<T, K>[],
    size: number
  ) {
    super(size);
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

export class ABDynamicSizeObject<T> extends BaseABDynamicSizeType<T> {

  constructor(
    private readonly fixedProperties: ABFixedSizeObjectProperty<T, keyof T>[],
    private readonly fixedSize: number,
    private readonly dynamicSizeObjectProperties: ABDynamicSizeObjectProperty<T, keyof T>[]
  ) {
    super();
  }

  public getSize(value: T): number {
    return this.fixedSize + this.dynamicSizeObjectProperties.reduce(
      (size, {key, abType}) => size + abType.getSize(value[key]),
      0
    );
  }

  public applyValues(arr: Float64Array, value: T): T {
    throw new Error("Not implemented.");
  }

  public extractValues(value: T, arr: Float64Array): void {
    throw new Error("Not implemented.");
  }

}