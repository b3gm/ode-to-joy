export function unknownEnumValue(value: never): never {
  throw new Error(`Unknown enum value: ${value}.`);
}