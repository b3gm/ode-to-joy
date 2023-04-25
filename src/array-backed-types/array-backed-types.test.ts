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

class Body {
  private force: TestVector;
  constructor(
    public position: TestVector,
    public velocity: TestVector
  ) {
    this.force = new TestVector(0, 0, 0);
  }
  
  applyForce(force: TestVector): void {
    this.force = new TestVector(this.force.x + force.x, this.force.y + force.y, this.force.z + force.z);
  }
}

interface LVec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

describe("ABObjectType", () => {
  it("should be fine with subset of properties", () => {
    const testVectorType: ABType<TestVector> = abTypes.object({
      x: abTypes.float(),
      y: abTypes.float()
    });
    const testVectorType2 = abTypes.object<TestVector>({
      x: abTypes.float(),
      z: abTypes.float()
    });
    expect(testVectorType).toBeTruthy();
    expect(testVectorType2).toBeTruthy();
  });
  it ("should reject invalid keys", () => {
    // @ts-expect-error "foo" is not a valid key in TestVector
    const testVectorType = abTypes.object<TestVector, "x" | "y" | "foo">({
      x: abTypes.float(),
      y: abTypes.float(),
      foo: abTypes.float()
    });
    expect(testVectorType).toBeTruthy();
  });
  it ("should work without type parameters", () => {
    const testType: ABType<LVec3> = abTypes.object({
      x: abTypes.float(),
      y: abTypes.float(),
      z: abTypes.float()
    });
    expect(testType).toBeTruthy();
  });
  it ("should suggest public object property types", () => {
    const testVectorType = abTypes.object<TestVector>({
      x: abTypes.float(),
      y: abTypes.float(),
      z: abTypes.float()
    });
    const bodyType = abTypes.object<Body>({
      position: testVectorType,
      velocity: testVectorType
    });
    expect(bodyType).toBeTruthy();
  })
});

describe("ABArray<TestVector>", () => {
  it("should work with arrays", () => {
    const testVectorType = abTypes.object<TestVector>({
      x: abTypes.float(),
      y: abTypes.float(),
      z: abTypes.float()
    });
    const testVectorArrayType = abTypes.array(
      testVectorType,
      3
    );
    expect(testVectorArrayType).toBeTruthy();
  });
});

interface Body {
  position: TestVector;
  velocity: TestVector;
}

describe("ABValue<TestVector>", () => {
  it("should work with value types", () => {
    const testVectorValueType = abTypes.valueObject<TestVector, LVec3>(
      ({x, y, z}) => new TestVector(x, y, z),
      {
        x: {
          abType: abTypes.float(),
          accessor: (v) => v.x
        },
        y: {
          abType: abTypes.float(),
          accessor: (v) => v.y
        },
        z: {
          abType: abTypes.float(),
          accessor: (v) => v.z
        }
      }
    );
    const bodyType: ABType<Body> = abTypes.object({
      position: testVectorValueType,
      velocity: testVectorValueType
    });
    expect(bodyType).toBeTruthy();
  })
})