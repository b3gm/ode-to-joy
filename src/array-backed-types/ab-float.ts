import { ABType } from "./ab-type";

export function float(): ABType<number> {
  return ABFloat.instance;
}

export class ABFloat implements ABType<number> {

  public static readonly instance = new ABFloat();

  public readonly size = 1.0;

  private constructor() {
  }
  
  extractValues(value: number, arr: Float64Array): void {
    arr[0] = value;
  }

  applyValues(arr: Float64Array, previousValue: number): number {
    return arr[0];
  }

}