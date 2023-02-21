import { Mesh, Quaternion, Vector3 } from "three";

export interface Body {
  mass: number;
  orientation: Quaternion;
  angularVelocity: Quaternion;
  position: Vector3;
  velocity: Vector3;
  force: Vector3;
  mesh: Mesh;
}