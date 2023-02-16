import { array } from "./array-backed-types/ab-array";

export function assertSameLength(a: Float64Array, b: Float64Array) {
  if (a.length !== b.length) {
    throw new Error(
      `Expected array to be of length ${a.length}, however actual length: ${b.length}.`
    );
  }
}

export function zeroes(length: number): Float64Array {
  return new Float64Array(length);
}

export function add(aElements: Float64Array, oElements: Float64Array): Float64Array {
  assertSameLength(aElements, oElements);
  const result = new Float64Array(aElements.length);
  const end = aElements.length;
  for (let i = 0; i !== end; ++i) {
    result[i] = aElements[i] + oElements[i];
  }
  return result;
}

export function subtract(aElements: Float64Array, oElements: Float64Array): Float64Array {
  assertSameLength(aElements, oElements);
  const result = new Float64Array(aElements.length);
  const end = aElements.length;
  for (let i = 0; i !== end; ++i) {
    result[i] = aElements[i] - oElements[i];
  }
  return result;
}

export function scalarMultiply(aElements: Float64Array, f: number): Float64Array {
  const result = new Float64Array(aElements.length);
  const end = aElements.length;
  for (let i = 0; i !== end; ++i) {
    result[i] = aElements[i] * f;
  }
  return result;
}

export function scalarDivide(aElements: Float64Array, f: number): Float64Array {
  const result = new Float64Array(aElements.length);
  const end = aElements.length;
  for (let i = 0; i !== end; ++i) {
    result[i] = aElements[i] / f;
  }
  return result;
}

export function addSelf(aElements: Float64Array, oElements: Float64Array): Float64Array {
  assertSameLength(aElements, oElements);
  const end = aElements.length;
  for (let i = 0; i !== end; ++i) {
    aElements[i] += oElements[i];
  }
  return aElements;
}

export function subtractSelf(aElements: Float64Array, oElements: Float64Array): Float64Array {
  assertSameLength(aElements, oElements);
  const end = aElements.length;
  for (let i = 0; i !== end; ++i) {
    aElements[i] -= oElements[i];
  }
  return aElements;
}

export function scalarMultiplySelf(aElements: Float64Array, f: number): Float64Array {
  const end = aElements.length;
  for (let i = 0; i !== end; ++i) {
    aElements[i] *= f;
  }
  return aElements;
}

export function scalarDivideSelf(aElements: Float64Array, f: number): Float64Array {
  const end = aElements.length;
  for (let i = 0; i !== end; ++i) {
    aElements[i] /= f;
  }
  return aElements;
}

export function addAllToFirst(first: Float64Array, ...others: Float64Array[]): Float64Array {
  for(let i = 0; i !== others.length; ++i) {
    addSelf(first, others[i]);
  }
  return first;
}

export function clone(aElements: Float64Array): Float64Array {
  const result = new Float64Array(aElements.length);
  const end = aElements.length;
  for (let i = 0; i !== end; ++i) {
    result[i] = aElements[i];
  }
  return result;
}

export function assignFrom(aElements: Float64Array, oElements: Float64Array): Float64Array {
  assertSameLength(aElements, oElements);
  const end = aElements.length;
  for (let i = 0; i !== end; ++i) {
    aElements[i] = oElements[i];
  }
  return aElements;
}