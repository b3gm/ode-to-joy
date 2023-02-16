import { Prng, Rng } from "./rng";
import { Body } from "./body";
import { Vector3, Quaternion } from "three";

export interface SolarSystem {
  bodies: Body[];
  asteroids: Body[];
}

export interface SolarSystemProps {
  bodyCount?: number;
  asteroidCount?: number;
  seed?: number;
  distanceScale?: [number, number];
}

export class RngUtil {

  constructor(private readonly rng: Rng) {
  }

  public next(a?: number, b?: number) {
    if (a !== undefined) {
      if (b !== undefined) {
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

}

export function createSolarSystem(props: SolarSystemProps = {}) {
  const {
    bodyCount = 10,
    asteroidCount = 0,
    distanceScale = [0.8, 1.2],
    seed = 4526374
  } = props;
  if (bodyCount < 2) {
    throw new Error(`Doesn't make sense to create ${bodyCount} (< 2) bodies.`)
  }
  const rng = new RngUtil(new Prng(seed));
  const bodies: Body[] = [];
  // create a sun
  bodies.push({
    mass: rng.next(600, 1400),
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
    force: new Vector3(0, 0, 0),
    orientation: rng.rotation(),
    angularVelocity: rng.angularVelocity(),
  });
  // create a bunch of other bodies
}