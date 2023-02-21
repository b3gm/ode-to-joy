import { TorusGeometry } from "three";
import { abTypes } from "../index"
import { ABType } from "./ab-type"

class TestVector {
  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}

  public dot({x, y, z}: TestVector) {
    return this.x * x + this.y * y + this.z * z;
  }
}

describe("ABObjectType", () => {
  it("should be fine with subset of properties", () => {
    const testVectorType: ABType<TestVector> = abTypes.object({
      x: abTypes.float(),
      y: abTypes.float(),
    })
  });
  it ("should reject invalid keys", () => {
    // @ts-expect-error even though the error is wrong, foo property should prevent success.
    const testVectorType: ABType<TestVector> = abTypes.object({
      x: abTypes.float(),
      y: abTypes.float(),
      z: abTypes.float(),
    })
  });
});

describe("ABArray<TestVector>", () => {
  it("should work with arrays", () => {
    const testVectorType = abTypes.object({
      x: abTypes.float(),
      y: abTypes.float(),
      z: abTypes.float()
    })
  });
});