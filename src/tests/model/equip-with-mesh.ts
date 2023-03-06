import { Mesh, SphereGeometry, MeshPhysicalMaterial, MeshPhysicalMaterialParameters } from "three";
import { Body } from "./body";

export interface EquipBodyWithMeshParams {
  densityFactor?: number
}

const equipBodyWithMesh = ({
  densityFactor = 1.0
}: EquipBodyWithMeshParams) => (body: Body) => {
  const {
    mass,
    position,
    velocity,
    orientation
  } = body;
  const mesh: Mesh = new Mesh(
    new SphereGeometry(
      Math.sqrt(mass) * densityFactor,
      12,
      6
    ),
    new MeshPhysicalMaterial({

    })
  );
  mesh.position = position;
  return {
    ...body,
    mesh
  };
}