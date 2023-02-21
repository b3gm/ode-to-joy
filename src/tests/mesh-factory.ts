import { Material, Mesh, MeshPhysicalMaterial, SphereGeometry } from "three";

export interface MeshFactory {
  (mass: number): Mesh;
}

export interface MeshFactoryProps {
  density: number;
}

export const defaultMeshFactory = ({
  density
}: MeshFactoryProps) =>
  (mass: number) => {
    const radius = Math.pow(mass / density, 1.0 / 3.0)
    return new Mesh(
      new SphereGeometry(radius, 12, 6),
      new MeshPhysicalMaterial({
        color: 0x0000ff
      })
    )
  }