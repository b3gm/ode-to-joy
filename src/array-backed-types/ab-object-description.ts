import { ABDynamicSizeType, ABFixedSizeType, ABType } from "./ab-type";
import { AnyFunction } from "./utils";

export type ABObjectDescription<T> = {
  [K in keyof T as T[K] extends (string | undefined | null | AnyFunction) ? never : K]?:
    ABType<T[K]>;
}

export interface ABObjectProperty<T, K extends keyof T> {
  readonly key: K;
  readonly abType: ABType<T[K]>;
}

export interface ABFixedSizeObjectProperty<T, K extends keyof T> extends ABObjectProperty<T, K> {
  readonly abType: ABFixedSizeType<T[K]>;
}

export interface ABDynamicSizeObjectProperty<T, K extends keyof T> extends ABObjectProperty<T, K> {
  readonly abType: ABDynamicSizeType<T[K]>;
}
