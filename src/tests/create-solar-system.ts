import { Prng, Rng } from "./rng";
import { Body } from "./body";
import { Vector3, Quaternion } from "three";
import { SolarSystem } from "./solar-system";
import { defaultMeshFactory, MeshFactory } from "./mesh-factory";
import { RngUtil } from "./rng-util";

const ex = Object.freeze(new Vector3(1.0, 0, 0));
const ey = Object.freeze(new Vector3(0.0, 1.0, 0.0));
const ez = Object.freeze(new Vector3(0.0, 0.0, 1.0));
const PI_HALF = Math.PI / 2.0;
const DEFAULT_MESH_FACTORY = defaultMeshFactory({
  density: 1.0
});

export interface SolarSystemProps {
  bodyCount?: number;
  asteroidCount?: number;
  seed?: number;
  radiusScale?: number;
  gravityConstant?: number;
  eclipticWobble?: number;
  velocityWobble?: number;
  radiusWobble?: [number, number],
  solarMassRange?: [number, number],
  planetaryMassRange?: [number, number],
  asteroidMassRange?: [number, number],
  asteroidBeltDistributionRange?: [number, number],
  resonances?: number[],
  meshFactory?: MeshFactory;
}

const COMMON_RESONANCES = [
  2.0,
  3.0 / 2.0,
  5.0 / 2.0,
  4.0 / 3.0,
  5.0 / 3.0,
  7.0 / 3.0,
  5.0 / 4.0,
  7.0 / 4.0,
  8.0 / 5.0,
];

function randomBody(
  rng: RngUtil,
  {
    massRange,
    starMass,
    radius,
    velocityWobble,
    eclipticWobble,
    gravityConstant,
    meshFactory,
  }: {
    massRange: [number, number],
    radius: number,
    starMass: number,
    velocityWobble: number,
    eclipticWobble: number,
    gravityConstant: number,
    meshFactory: MeshFactory
  }
): Body {
  const mass = rng.next(massRange);
  const circularVelocity = Math.sqrt(starMass * gravityConstant / radius);
  const phase = rng.next(Math.PI * 2);
  // A random vector that is just slightly off from the true ecliptic perpendicular direction
  const localEy = new Vector3(
    rng.next(-eclipticWobble, eclipticWobble),
    1.0,
    rng.next(-eclipticWobble, eclipticWobble)
  )
    .normalize();
  const localEx = localEy.clone().cross(ex).normalize();
  const localEz = localEy.clone().cross(localEx).normalize();
  const mesh = meshFactory(mass);
  const orientation = rng.rotation();
  return {
    mass,
    angularVelocity: rng.angularVelocity(),
    orientation: mesh.quaternion.copy(orientation),
    force: new Vector3(),
    position: mesh.position.copy(
      new Vector3()
        .addScaledVector(
          localEx,
          Math.cos(phase)
        )
        .addScaledVector(
          localEz,
          Math.sin(phase)
        )
        .multiplyScalar(radius)
    ),
    velocity: new Vector3()
      .addScaledVector(
        localEx,
        - Math.sin(phase)
      )
      .addScaledVector(
        localEz,
        Math.cos(phase)
      )
      // random disturbance added to velocity
      .add(new Vector3(
        rng.next(- velocityWobble, velocityWobble),
        rng.next(- velocityWobble, velocityWobble),
        rng.next(- velocityWobble, velocityWobble)
      ))
      .multiplyScalar(circularVelocity),
    mesh
  }
}

export function createSolarSystem(props: SolarSystemProps = {}): SolarSystem {
  const {
    bodyCount = 10,
    asteroidCount = 0,
    radiusScale = 1.0,
    seed = 4526374,
    gravityConstant = 1.0,
    eclipticWobble = 0.0,
    velocityWobble = 0.0,
    solarMassRange = [600, 1400],
    planetaryMassRange = [5, 50],
    asteroidMassRange = [0.001, 0.01],
    resonances = COMMON_RESONANCES,
    asteroidBeltDistributionRange = [0.45, 0.55],
    radiusWobble = [0.98, 1.02],
    meshFactory = DEFAULT_MESH_FACTORY
  } = props;
  if (bodyCount < 2) {
    throw new Error(`Doesn't make sense to create ${bodyCount} (< 2) bodies.`)
  }
  const rng = new RngUtil(new Prng(seed));
  const celestialBodies: Body[] = [];
  // create a central star
  const starMass = rng.next(solarMassRange);
  celestialBodies.push({
    mass: starMass,
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
    force: new Vector3(0, 0, 0),
    orientation: rng.rotation(),
    angularVelocity: rng.angularVelocity(),
    mesh: meshFactory(starMass),
  });
  // create a bunch of planets
  let currentRadius = radiusScale;
  for (let i = 0; i != bodyCount; ++i) {
    currentRadius = currentRadius * rng.nextItem(resonances) * rng.next(radiusWobble);
    celestialBodies.push(
      randomBody(
        rng,
        {
          gravityConstant,
          massRange: planetaryMassRange,
          radius: currentRadius,
          starMass,
          eclipticWobble,
          velocityWobble,
          meshFactory
        }
      )
    );
  }
  const asteroids: Body[] = [];
  const asteroidBeltRadius = currentRadius;
  for (let i = 0; i != asteroidCount; ++i) {
    asteroids.push(
      randomBody(
        rng,
        {
          gravityConstant,
          massRange: asteroidMassRange,
          radius: asteroidBeltRadius * rng.next(asteroidBeltDistributionRange),
          starMass,
          eclipticWobble,
          velocityWobble,
          meshFactory
        }
      )
    );
  }
  return {
    gravityConstant,
    celestialBodies,
    asteroids
  }
}