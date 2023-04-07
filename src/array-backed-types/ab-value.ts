import {
  ABDynamicSizeType,
  BaseABDynamicSizeType,
  FloatReader,
  FloatWriter,
} from "./ab-type";
import { BaseABFixedSizeType } from "./ab-type";
import { ABFixedSizeType, ABType } from "./ab-type";
import { unknownEnumValue } from "./utils";

export interface Property<T, P, K extends keyof P> {
  readonly abType: ABType<P[K]>;
  readonly accessor: (item: T) => P[K];
}

export interface FixedSizeProperty<T, P, K extends keyof P> {
  readonly abType: ABFixedSizeType<P[K]>;
  readonly accessor: (item: T) => P[K];
}

export interface DynamicSizeProperty<T, P, K extends keyof P> {
  readonly abType: ABDynamicSizeType<P[K]>;
  readonly accessor: (item: T) => P[K];
}

interface FixedSizePropertyDescription<T, P, K extends keyof P>
  extends FixedSizeProperty<T, P, K>
{
  readonly key: K;
}

interface DynamicSizePropertyDescription<T, P, K extends keyof P>
  extends DynamicSizeProperty<T, P, K>
{
  readonly key: K;
}

type PropertyDescription<T, P, K extends keyof P> =
  | FixedSizePropertyDescription<T, P, K>
  | DynamicSizePropertyDescription<T, P, K>;

export type ValueObjectDescription<T, P> = {
  readonly [K in keyof P as P[K] extends (string | undefined | null | Function) ? never : K]?:
    Property<T, P, K>;
}

export function valueObject<T, P>(
  ctor: (props: P) => T,
  description: ValueObjectDescription<T, P>
): ABType<T> {
  const fixedSizeProperties: FixedSizePropertyDescription<T, P, keyof P>[] = [];
  const dynamicSizeProperties: DynamicSizePropertyDescription<T, P, keyof P>[] = [];
  for (let key in description) {
    const voProperty = description[key];
    if (voProperty) {
      const {abType, accessor} = voProperty;
      const abSizeType = abType.abSizeType;
      switch(abSizeType) {
      case "FIXED":
        fixedSizeProperties.push({key, abType, accessor} as FixedSizePropertyDescription<T, P, keyof P>);
        break;
      case "DYNAMIC":
        dynamicSizeProperties.push({key, abType, accessor} as DynamicSizePropertyDescription<T, P, keyof P>);
        break;
      default:
        return unknownEnumValue(abSizeType);
      }
    }
  }
  const fixedSize = fixedSizeProperties.reduce((acc, prop) => acc + prop.abType.size, 0);
  if (dynamicSizeProperties.length === 0) {
    return new ABFixedSizeValue(fixedSizeProperties, fixedSize, ctor);
  }
  return new ABDynamicSizeValue(fixedSizeProperties, fixedSize, dynamicSizeProperties, ctor);
}

function extractValues<T, P, K extends keyof P, ABT extends PropertyDescription<T, P, K>>(
  properties: ABT[],
  value: T,
  writer: FloatWriter
) {
  for (const {abType, accessor} of properties) {
    const propertyValue = accessor(value);
    abType.extractValues(
      propertyValue,
      writer
    );
  }
}

function applyValues<T, P, K extends keyof P, ABT extends PropertyDescription<T, P, K>>(
  properties: ABT[],
  ctorProps: P,
  reader: FloatReader,
  value: T
) {
  for (let {key, abType, accessor} of properties) {
    const propertyValue = accessor(value);
    ctorProps[key] = abType.applyValues(
      reader,
      propertyValue
    );
  }
}

class ABFixedSizeValue<T, P, K extends keyof P> extends BaseABFixedSizeType<T> {

  constructor(
    private readonly properties: FixedSizePropertyDescription<T, P, K>[],
    size: number,
    private readonly ctor: (props: P) => T
  ) {
    super(size);
  }

  extractValues(value: T, writer: FloatWriter): void {
    extractValues<T, P, K, FixedSizePropertyDescription<T, P, K>>(
      this.properties,
      value,
      writer
    );
  }

  applyValues(reader: FloatReader, value: T): T {
    const ctorProps: P = {} as P;
    applyValues(this.properties, ctorProps, reader, value);
    return this.ctor(ctorProps);
  }

}

class ABDynamicSizeValue<T, P, K extends keyof P> extends BaseABDynamicSizeType<T> {
  constructor(
    private readonly fixedSizeProperties: FixedSizePropertyDescription<T, P, K>[],
    private readonly fixedSize: number,
    private readonly dynamicSizeProperties: DynamicSizePropertyDescription<T, P, K>[],
    private readonly ctor: (props: P) => T
  ) {
    super();
  }

  public getSize(value: T): number {
    return this.fixedSize + this.dynamicSizeProperties.reduce(
      (acc, {abType, accessor}) => acc + abType.getSize(accessor(value)),
      0
    );
  }

  public extractValues(value: T, writer: FloatWriter): void {
    extractValues<T, P, K, FixedSizePropertyDescription<T, P, K>>(
      this.fixedSizeProperties,
      value,
      writer
    );
    extractValues<T, P, K, DynamicSizePropertyDescription<T, P, K>>(
      this.dynamicSizeProperties,
      value,
      writer
    );
  }

  public applyValues(reader: FloatReader, value: T): T {
    const ctorProps: P = {} as P;
    applyValues(this.fixedSizeProperties, ctorProps, reader, value);
    applyValues(this.dynamicSizeProperties, ctorProps, reader, value);
    return this.ctor(ctorProps);
  }
}