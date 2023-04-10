import {
  ABFixedSizeType,
  ABType,
  BaseABDynamicSizeType,
  BaseABFixedSizeType,
  FloatReader,
  FloatWriter
} from "./ab-type";
import { unknownEnumValue } from "./utils";

export function array<T>(abType: ABType<T>, fixedLength: number = -1.0): ABType<T[]> {
  if (fixedLength < 0) {
    return new ABDynamicSizeArray(abType);
  } else {
    const abSizeType = abType.abSizeType;
    switch(abSizeType) {
    case "FIXED":
      return new ABFixedSizeArray(abType, fixedLength);
    case "DYNAMIC":
      return new ABDynamicSizeArray(abType);
    default:
      return unknownEnumValue(abSizeType);
    }
  }
}

function extractValues<T>(itemType: ABType<T>, values: T[], writer: FloatWriter): void {
  values.forEach((v) => itemType.extractValues(v, writer));
}

function applyValues<T>(itemType: ABType<T>, reader: FloatReader, values: T[]): T[] {
  for (let i = 0; i != values.length; ++i) {
    // updating array in place is intentional.
    values[i] = itemType.applyValues(reader, values[i]);
  }
  return values;
}

class ABFixedSizeArray<T> extends BaseABFixedSizeType<T[]> {

  constructor(private readonly itemType: ABFixedSizeType<T>, private readonly length: number) {
    super(length * itemType.size);
  }

  extractValues(values: T[], writer: FloatWriter): void {
    if (values.length !== this.length) {
      throw new Error(
        `Expected array of length ${this.length}, got array of length ${values.length} instead.`
      );
    }
    extractValues(this.itemType, values, writer);
  }

  applyValues(reader: FloatReader, values: T[]): T[] {
    return applyValues(this.itemType, reader, values);
  }
}

class ABDynamicSizeArray<T> extends BaseABDynamicSizeType<T[]> {
  constructor(
    private readonly itemType: ABType<T>
  ) {
    super();
  }

  public getSize(value: T[]): number {
    const abType = this.itemType;
    const abSizeType = abType.abSizeType;
    switch(abSizeType) {
    case "FIXED":
      return value.length * abType.size;
    case "DYNAMIC":
      return value.reduce((acc, v) => acc + abType.getSize(v), 0);
    default:
      return unknownEnumValue(abSizeType);
    }
  }

  public extractValues(values: T[], writer: FloatWriter): void {
    extractValues(this.itemType, values, writer);
  }

  public applyValues(reader: FloatReader, values: T[]): T[] {
    return applyValues(this.itemType, reader, values);
  }

}