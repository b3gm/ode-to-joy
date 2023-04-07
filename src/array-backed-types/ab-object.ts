import {
  ABObjectDescription,
  ABFixedSizeObjectProperty,
  ABDynamicSizeObjectProperty,
  ABObjectProperty
} from "./ab-object-description";
import {
  ABType,
  BaseABDynamicSizeType,
  BaseABFixedSizeType,
  FloatReader,
  FloatWriter
} from "./ab-type";
import { unknownEnumValue } from "./utils";


export function object<
  T
>(props: ABObjectDescription<T>): ABType<T> {
  let fixedSize = 0;
  const fixedProperties: ABFixedSizeObjectProperty<T, keyof T>[] = [];
  const dynamicProperties: ABDynamicSizeObjectProperty<T, keyof T>[] = [];
  for (let key in props) {
    const abType = props[key];
    if (abType !== undefined) {
      const abSizeType = abType.abSizeType;
      switch(abSizeType) {
      case "FIXED":
        fixedProperties.push({
          key,
          abType
        } as ABFixedSizeObjectProperty<T, keyof T>);
        fixedSize += abType.size;
        break;
      case "DYNAMIC":
        dynamicProperties.push({
          key,
          abType
        } as ABDynamicSizeObjectProperty<T, keyof T>);
        break;
      default:
        return unknownEnumValue(abSizeType);
      }
    }
  }
  if (dynamicProperties.length === 0) {
    return new ABFixedSizeObject(fixedProperties, fixedSize);
  }
  return new ABDynamicSizeObject(fixedProperties, fixedSize, dynamicProperties);
}

function extractValues<T, ABT extends ABObjectProperty<T, keyof T>>(
  properties: ABT[],
  value: T,
  writer: FloatWriter
) {
  for (const {key, abType} of properties) {
    const propertyValue = value[key];
    abType.extractValues(propertyValue, writer);
  }
}

function applyValues<T, ABT extends ABObjectProperty<T, keyof T>>(
  properties: ABT[],
  reader: FloatReader,
  value: T
) {
  for (const {key, abType} of properties) {
    const targetValue = value[key];
    const appliedValue = abType.applyValues(
      reader,
      targetValue
    );
    value[key] = appliedValue;
  }
  return value;
}

class ABFixedSizeObject<T, K extends keyof T> extends BaseABFixedSizeType<T> {
  constructor(
    private readonly properties: ABFixedSizeObjectProperty<T, K>[],
    size: number
  ) {
    super(size);
  }

  extractValues(value: T, writer: FloatWriter): void {
    extractValues(this.properties, value, writer);
  }

  applyValues(reader: FloatReader, value: T): T {
    return applyValues(
      this.properties,
      reader,
      value
    );
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

  public applyValues(reader: FloatReader, value: T): T {
    applyValues(
      this.fixedProperties,
      reader,
      value
    );
    applyValues(
      this.dynamicSizeObjectProperties,
      reader,
      value
    );
    return value;
  }

  public extractValues(value: T, writer: FloatWriter): void {
    extractValues(
      this.fixedProperties,
      value,
      writer
    );
    extractValues(
      this.dynamicSizeObjectProperties,
      value,
      writer
    );
  }

}