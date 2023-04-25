import {
  ABType,
  BaseABFixedSizeType,
  FloatReader,
  FloatWriter
} from "./ab-type";

export function float(): ABType<number> {
  return ABFloat.instance;
}

export class ABFloat extends BaseABFixedSizeType<number> {

  public static readonly instance = new ABFloat();

  private constructor() {
    super(1.0);
  }
  
  extractValues(value: number, writer: FloatWriter): void {
    writer(value);
  }

  applyValues(reader: FloatReader): number {
    return reader();
  }

}