import { ABType, BaseABFixedSizeType } from "./ab-type";

export function float(): ABType<number> {
  return ABFloat.instance;
}

export class ABFloat extends BaseABFixedSizeType<number> {

  public static readonly instance = new ABFloat();

  private constructor() {
    super(1.0);
  }
  
  extractValues(value: number, arr: Float64Array): void {
    arr[0] = value;
  }

  applyValues(arr: Float64Array, previousValue: number): number {
    return arr[0];
  }

}