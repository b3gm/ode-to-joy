import { Light, Mesh, Quaternion, Vector3 } from "three";
import { AxialAmount } from "./axial-amount";
import { LQuaternion, LVec3 } from "./literals";

export interface Body {
  mass: number;
  orientation: Quaternion;
  angularVelocity: AxialAmount;
  position: Vector3;
  velocity: Vector3;
  force: Vector3;
  mesh: Mesh;
  light?: Light;

  tic(delta: number): void;
}

export interface BodyParameters {
  mass: number;
  orientation: LQuaternion;
  angularVelocity: AxialAmount;
  position: LVec3;
  velocity: LVec3;
  mesh: Mesh;
  light?: Light;
}

export function assignQuaternion(
  q: Quaternion,
  {x, y, z, w}: LQuaternion
): Quaternion {
  return q.set(x, y, z, w);
}

export function assignVector(vec: Vector3, values: LVec3): Vector3 {
  return vec.set(values.x, values.y, values.z);
}

export abstract class BaseBody implements Body {

  public readonly mass: number;
  public readonly orientation: Quaternion;
  public readonly angularVelocity: AxialAmount;
  public readonly position: Vector3;
  public readonly velocity: Vector3;
  public readonly force: Vector3;
  public readonly mesh:  Mesh;
  public readonly light?: Light;

  constructor(parameters: BodyParameters) {
    this.mass = parameters.mass;
    const mesh = parameters.mesh;
    this.orientation = assignQuaternion(mesh.quaternion, parameters.orientation);
    this.angularVelocity = parameters.angularVelocity;
    this.position = assignVector(mesh.position, parameters.position);
    this.velocity = assignVector(new Vector3(), parameters.velocity);
    this.force = new Vector3();
    this.mesh = mesh;
    this.light = parameters.light;
  }

  abstract tic(delta: number): void;
}

export class CelestialBody extends BaseBody {
  
  constructor(parameters: BodyParameters) {
    super(parameters);
  }

  public tic(delta: number): void {
    const angVelQuat = new Quaternion().setFromAxisAngle(
      this.angularVelocity.axis,
      this.angularVelocity.amount * delta
    );
    this.orientation.multiplyQuaternions(
      angVelQuat.clone()
        .conjugate()
        .multiply(this.orientation),
      angVelQuat
    );
    if (this.light) {
      this.light.position.copy(this.position);
    }
  }
}

export class Ship extends BaseBody {

  constructor(parameters: BodyParameters) {
    super(parameters);
  }

  public tic(): void {
    // intentionally empty
  }
}