import { Quaternion, Vector3 } from "three";
import { Rng } from "./rng";

export class RngUtil {

  constructor(private readonly rng: Rng) {
  }

  public nextInt(a: number, b?: number) {
    return Math.floor(this.next(a, b));
  }

  public next(arr?: [number, number]): number;
  public next(start?: number, end?: number): number;
  public next(a?: number | [number, number], b?: number) {
    if (a !== undefined) {
      if (a instanceof Array) {
        const [start, end] = a;
        return start + this.rng.nextDouble() * (end - start);
      } else if (b !== undefined) {
        return a + this.rng.nextDouble() * (b - a);
      }
      return this.rng.nextDouble() * a;
    }
    return this.rng.nextDouble();
  }

  public rotation() {
    return new Quaternion(
      this.next(),
      this.next(),
      this.next(),
      this.next()
    )
      .normalize();
  }

  public angularVelocity() {
    return new Quaternion()
      .setFromAxisAngle(
        new Vector3(this.next(), this.next(), this.next()).normalize(),
        this.next(- Math.PI / 5, Math.PI / 5),
      );
  }

  public nextItem<T>(items: T[]): T {
    return items[this.nextInt(items.length)];
  }

}