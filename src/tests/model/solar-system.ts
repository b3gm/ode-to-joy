import { Body } from "./body";

export interface SolarSystemProps {
  gravityConstant: number;
  celestialBodies: Body[];
  asteroids: Body[];
}

export class SolarSystem implements SolarSystemProps {
  public readonly gravityConstant: number;
  public readonly celestialBodies: Body[];
  public readonly asteroids: Body[];
  
  constructor({
    gravityConstant,
    celestialBodies,
    asteroids
  }: SolarSystemProps) {
    this.gravityConstant = gravityConstant;
    this.celestialBodies = celestialBodies;
    this.asteroids = asteroids;
  }

  public forEachBody(action: (body: Body) => void): void {
    this.celestialBodies.forEach(action);
    this.asteroids.forEach(action);
  }
}