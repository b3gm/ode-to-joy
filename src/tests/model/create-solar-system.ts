import { Prng } from "./rng";
import { Body, CelestialBody } from "./body";
import { Light, PointLight, Vector3 } from "three";
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

export interface CreateSolarSystemParameters {
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
    light
  }: {
    massRange: [number, number],
    radius: number,
    starMass: number,
    velocityWobble: number,
    eclipticWobble: number,
    gravityConstant: number,
    meshFactory: MeshFactory,
    light?: Light
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
  return new CelestialBody({
    mass,
    angularVelocity: rng.angularVelocity(),
    orientation: mesh.quaternion.copy(orientation),
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
    mesh,
    light
  });
}

export function createSolarSystem({
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
}: CreateSolarSystemParameters = {}): SolarSystem {
  if (bodyCount < 2) {
    throw new Error(`Doesn't make sense to create ${bodyCount} (< 2) bodies.`)
  }
  const rng = new RngUtil(new Prng(seed));
  const celestialBodies: Body[] = [];
  // create a central star
  const starMass = rng.next(solarMassRange);
  celestialBodies.push(new CelestialBody({
    mass: starMass,
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
    orientation: rng.rotation(),
    angularVelocity: rng.angularVelocity(),
    mesh: meshFactory(starMass),
    light: new PointLight(0xffffff, 2.0),
  }));
  // create a bunch of planets
  let currentRadius = radiusScale;
  let roundTripFactor = 2 * Math.PI / Math.sqrt(starMass * gravityConstant);
  let targetRoundTripTime = Math.pow(currentRadius, 1.5) * roundTripFactor;
  for (let i = 0; i != bodyCount; ++i) {
    targetRoundTripTime = rng.nextItem(resonances) * targetRoundTripTime;
    // solve above equation for radius with updated round trip time
    currentRadius = Math.pow(targetRoundTripTime / roundTripFactor, 0.6667);
    currentRadius = currentRadius * rng.next(radiusWobble);
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
  // settiung total momentum to 0.0
  const totalMass = 
    asteroids.reduce((acc, ast) => acc + ast.mass, 0.0)
    + celestialBodies.reduce((acc, body) => acc + body.mass, 0.0);
  const systemCogVelocity = asteroids.reduce(
    (acc, ast) => acc.add(ast.velocity.clone().multiplyScalar(ast.mass)), new Vector3()
  )
    .add(
      celestialBodies.reduce(
        (acc, body) => acc.add(body.velocity.clone().multiplyScalar(body.mass)),
        new Vector3()
      )
    )
    .divideScalar(totalMass);
  celestialBodies.forEach(body => body.velocity.sub(systemCogVelocity));
  asteroids.forEach(ast => ast.velocity.sub(systemCogVelocity));
  return new SolarSystem({
    gravityConstant,
    celestialBodies,
    asteroids
  });
}