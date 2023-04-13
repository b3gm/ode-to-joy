import { Body } from "./body";
import { SolarSystem, SolarSystemProps } from "./solar-system";

function derivePositionAndVelocity(body: Body) {
  body.position.copy(body.velocity);
  // a = F / m
  body.velocity.copy(body.force).divideScalar(body.mass);
}

export function derivative(system: SolarSystem): SolarSystem {
  const {
    gravityConstant,
    celestialBodies,
    asteroids
  } = system;
  system.forEachBody(b => b.force.set(0, 0, 0));
  for (let i = 0; i !== celestialBodies.length; ++i) {
    const iBody = celestialBodies[i];
    for (let j = 0; j != i; ++j) {// only need to iterate through j < i
      const jBody = celestialBodies[j];
      const diff = jBody.position.clone().sub(iBody.position);
      const distanceSquare = diff.dot(diff);
      const gravity = diff.multiplyScalar(
        gravityConstant * iBody.mass * jBody.mass / Math.pow(distanceSquare, 1.5)
      );
      // and add force exchanged to both bodies
      iBody.force.add(gravity);
      jBody.force.addScaledVector(gravity, -1.0);
    }
    for (const asteroid of asteroids) {
      const diff = iBody.position.clone().sub(asteroid.position);
      const distanceSquare = diff.dot(diff);
      const gravity = diff.multiplyScalar(
        gravityConstant * iBody.mass * asteroid.mass / Math.pow(distanceSquare, 1.5)
      );
      asteroid.force.add(gravity);
    }
  }
  system.forEachBody(derivePositionAndVelocity);
  return system;
}