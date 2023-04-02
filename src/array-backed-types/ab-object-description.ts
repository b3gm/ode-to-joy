import { ABDynamicSizeType, ABFixedSizeType, ABType } from "./ab-type";

export type ABObjectDescription<T> = {
  [K in keyof T as T[K] extends (string | undefined | null | Function) ? never : K]?: ABType<T[K]>;
}

export interface ABFixedSizeObjectProperty<T, K extends keyof T> {
  readonly key: K;
  readonly abType: ABFixedSizeType<T[K]>;
}

export interface ABDynamicSizeObjectProperty<T, K extends keyof T> {
  readonly key: K;
  readonly abType: ABDynamicSizeType<T[K]>;
}