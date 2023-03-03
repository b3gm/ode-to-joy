import { Vector3 } from "three";
import { abTypes } from "../index";
import { Body } from "./body";
import { SolarSystem } from "./solar-system";

type ABThreeVectorProps = "x" | "y" | "z";
type ABBodyProps = "position" | "velocity" | "force";
type ABSolarSystemProps = "celestialBodies" | "asteroids";

const abThreeVector = abTypes.object<Vector3, ABThreeVectorProps>({
  x: abTypes.float(),
  y: abTypes.float(),
  z: abTypes.float()
});

const abBody = abTypes.object<Body, ABBodyProps>({
  position: abThreeVector,
  velocity: abThreeVector,
  force: abThreeVector
});

export function abSolarSystem({celestialBodies, asteroids}: SolarSystem) {
  return abTypes.object<SolarSystem, ABSolarSystemProps>({
    celestialBodies: abTypes.array(abBody, celestialBodies.length),
    asteroids: abTypes.array(abBody, asteroids.length)
  });
};