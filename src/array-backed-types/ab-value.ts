import { ABType } from "./ab-type";

export interface ValueObjectProperty<T, P, K extends keyof P> {
  abType: ABType<P[K]>;
  accessor: (item: T) => P[K];
}

export interface ValueObjectPropertyDescription<T, P, K extends keyof P> extends ValueObjectProperty<T, P, K> {
  key: K;
}

export type ValueObjectDescription<T, P> = {
  [K in keyof P]: ValueObjectProperty<T, P, K>;
}

export function valueObject<T, P>(
  ctor: (props: P) => T,
  description: ValueObjectDescription<T, P>
): ABType<T> {
  const properties: ValueObjectPropertyDescription<T, P, keyof P>[] = [];
  for (let key in description) {
    const {abType, accessor} = description[key];
    properties.push({key, abType, accessor});
  }
  return new ABValue(properties, ctor);
}

class ABValue<T, P, K extends keyof P> implements ABType<T> {

  public readonly size: number;

  constructor(
    private readonly properties: ValueObjectPropertyDescription<T, P, K>[],
    private readonly ctor: (props: P) => T
  ) {
    this.size = properties.length;
  }

  extractValues(value: T, arr: Float64Array): void {
    let index = 0;
    for (let {abType, accessor} of this.properties) {
      const nextIndex = index + abType.size;
      abType.extractValues(
        accessor(value),
        arr.subarray(index, nextIndex)
      );
      index = nextIndex;
    }
  }

  applyValues(arr: Float64Array, value: T): T {
    let index = 0;
    const ctorProps: {[K in keyof P]?: P[K]} = {};
    for (let {key, abType, accessor} of this.properties) {
      const nextIndex = index + abType.size;
      ctorProps[key] = abType.applyValues(
        arr.subarray(index, nextIndex),
        accessor(value)
      );
    }
    return this.ctor(ctorProps as P);
  }

}