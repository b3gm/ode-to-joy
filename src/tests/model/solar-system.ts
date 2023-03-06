import { Body } from "./body";

export interface SolarSystem {
  gravityConstant: number;
  celestialBodies: Body[];
  asteroids: Body[];
}
