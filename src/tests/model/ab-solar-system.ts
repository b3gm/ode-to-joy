import { Vector3 } from "three";
import { abTypes } from "../../index";
import { Body } from "./body";
import { SolarSystem } from "./solar-system";

type ABThreeVectorProps = "x" | "y" | "z";
type ABBodyProps = "position" | "velocity" | "force";
type ABSolarSystemProps = "celestialBodies" | "asteroids";

const abThreeVector = abTypes.object<Vector3>({
  x: abTypes.float(),
  y: abTypes.float(),
  z: abTypes.float()
});

const abBody = abTypes.object<Body>({
  position: abThreeVector,
  velocity: abThreeVector,
  force: abThreeVector
});

export const abSolarSystem = abTypes.object<SolarSystem>({
  celestialBodies: abTypes.array(abBody),
  asteroids: abTypes.array(abBody)
});