import { Mesh, SphereGeometry, Color, MeshStandardMaterial } from "three";

const black = new Color(0);
const white = new Color(0xffffff);
const yellow = new Color(0xffff00);
const orange = new Color(0xff8000);
const red = new Color(0xA00000);
const blue = new Color(0x0000ff);
const grey = new Color(0x808080);
export interface MeshFactory {
  (mass: number): Mesh;
}

export interface MeshFactoryProps {
  density: number;
  emissive?: boolean;
  massToColor?: (mass: number) => Color;
}

interface ColorPoint {
  color: Color;
  mass: number;
}

const colorBand: ColorPoint[] = [
  {
    color: white,
    mass: 1300
  },
  {
    color: yellow,
    mass: 800
  },
  {
    color: orange,
    mass: 400
  },
  {
    color: red,
    mass: 200
  },
  {
    color: blue,
    mass: 50,
  },
  {
    color: grey,
    mass: 1
  }
];

const colorBandFactory = (band: ColorPoint[]) => {
  band.sort((a, b) => b.mass - a.mass);
  return (mass: number) => {
    let lastPoint: ColorPoint | null = null;
    for (const point of band) {
      if (mass > point.mass) {
        if (lastPoint === null) {
          return point.color.clone();
        } else {
          return point.color.clone().lerp(
            lastPoint.color,
            (lastPoint.mass - mass) / (lastPoint.mass - point.mass)
          );
        }
      }
      lastPoint = point;
    }
    if (lastPoint === null) {
      throw new Error("ColorBand is empty.");
    }
    return lastPoint.color;
  }
}

function getEmissiveColor(mass: number, color: Color): Color {
  if (mass > 1000) {
    return color;
  }
  if (mass < 500) {
    return black;
  }
  return black.clone()
    .lerp(color, Math.min(1.0, (1000 - mass) / 100));
}

export const defaultMeshFactory = ({
  density,
  massToColor = colorBandFactory(colorBand),
}: MeshFactoryProps) =>
  (mass: number) => {
    const radius = Math.pow(mass / density, 1.0 / 3.0);
    const color = massToColor(mass);
    return new Mesh(
      new SphereGeometry(radius, 12, 6),
      new MeshStandardMaterial({
        color: color,
        emissive: getEmissiveColor(mass, color),
        emissiveIntensity: 1.0,
        roughness: 0.9,
        metalness: 0.0
      })
    )
  }