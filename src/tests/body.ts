import * as three from "three";

export interface Body {
  mass: number;
  orientation: three.Quaternion;
  angularVelocity: three.Quaternion;
  position: three.Vector3;
  velocity: three.Vector3;
  force: three.Vector3;
}