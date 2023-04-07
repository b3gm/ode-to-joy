import { Quaternion, Vector3 } from "three";
import { Rng } from "./rng";
import { AxialAmount } from "./axial-amount";
import { Vector } from "../../vector";

const PI_2 = 2 * Math.PI;

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

  public randomNormalizedVector() {
    let vec: Vector3;
    let rounds = 0;
    do {
      ++rounds;
      vec = new Vector3(this.next(-0.5, 0.5), this.next(), this.next());
      if (rounds >= 10) {
        throw new Error("Could not find non null vector after 10 rounds of trying.");
      }
    } while(vec.length() === 0.0);// paranoia, should never happen.
    return vec.normalize();
  }

  public angularVelocity(maxAngularVelocity = 0.03): AxialAmount {
    return {
      axis: this.randomNormalizedVector(),
      amount: this.next(- maxAngularVelocity, maxAngularVelocity)
    }
  }

  public nextItem<T>(items: T[]): T {
    return items[this.nextInt(items.length)];
  }

}