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

interface LVec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface PartialVector {
  x: number;
  y: number;
}

describe("ABObjectType", () => {
  it("should be fine with subset of properties", () => {
    const testVectorType = abTypes.object<TestVector, keyof PartialVector>({
      x: abTypes.float(),
      y: abTypes.float(),
    })
  });
  it ("should reject invalid keys", () => {
    // @ts-expect-error "foo" is not a valid key in TestVector
    const testVectorType = abTypes.object<TestVector, "x" | "y" | "foo">({
      x: abTypes.float(),
      y: abTypes.float(),
      foo: abTypes.float(),
    })
  });
  it ("should work without type parameters", () => {
    const testType: ABType<LVec3> = abTypes.object({
      x: abTypes.float(),
      y: abTypes.float(),
      z: abTypes.float()
    });
  });
});

describe("ABArray<TestVector>", () => {
  it("should work with arrays", () => {
    const testVectorType = abTypes.object<TestVector, "x" | "y" | "z">({
      x: abTypes.float(),
      y: abTypes.float(),
      z: abTypes.float()
    });
    const testVectorArrayType = abTypes.array(
      testVectorType,
      3
    );
  });
});

interface Body {
  position: TestVector;
  velocity: TestVector;
}

describe("ABValue<TestVector>", () => {
  it("should work with value types", () => {
    const testVectorValueType = abTypes.valueObject(
      ({x, y, z}) => new TestVector(x, y, z),
      {
        x: {
          abType: abTypes.float(),
          accessor: v => v.x
        },
        y: {
          abType: abTypes.float(),
          accessor: v => v.y
        },
        z: {
          abType: abTypes.float(),
          accessor: v => v.z
        }
      }
    );
    const bodyTypey: ABType<Body> = abTypes.object({
      position: testVectorValueType,
      velocity: testVectorValueType
    })
  })
})