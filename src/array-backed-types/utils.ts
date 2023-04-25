export type AnyFunction = (...args: unknown[]) => unknown;

export function unknownEnumValue(value: never): never {
  throw new Error(`Unknown enum value: ${value}.`);
}
