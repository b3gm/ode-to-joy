import { array } from "./array-backed-types/ab-array";
import { object } from "./array-backed-types/ab-object";
import { float } from "./array-backed-types/ab-float";
import { valueObject } from "./array-backed-types/ab-value";
import { ABType } from "./array-backed-types/ab-type";

export * as explicitSolvers from "./explicit-solvers";

export const abTypes = {
  array,
  object,
  float,
  valueObject
}

export type typeOf<T> = T extends ABType<infer U> ? U : never;
