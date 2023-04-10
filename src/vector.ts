import { assertSameLength } from "./array-operations";


export class Vector {

  constructor(private readonly elements: Float64Array) {
  }

  public add(o: Vector): Vector {
    assertSameLength(this.elements, o.elements);
    const result = new Float64Array();
    const end = this.elements.length;
    for (let i = 0; i !== end; ++i) {
      result[i] = this.elements[i] + o.elements[i];
    }
    return new Vector(result);
  }

  public subtract(o: Vector): Vector {
    assertSameLength(this.elements, o.elements);
    const result = new Float64Array();
    const end = this.elements.length;
    for (let i = 0; i !== end; ++i) {
      result[i] = this.elements[i] - o.elements[i];
    }
    return new Vector(result);
  }

  public scalarMultiply(f: number): Vector {
    const result = new Float64Array();
    const end = this.elements.length;
    for (let i = 0; i !== end; ++i) {
      result[i] = this.elements[i] * f;
    }
    return new Vector(result);
  }

  public scalarDivide(f: number): Vector {
    const result = new Float64Array();
    const end = this.elements.length;
    for (let i = 0; i !== end; ++i) {
      result[i] = this.elements[i] / f;
    }
    return new Vector(result);
  }

  public addSelf(o: Vector): Vector {
    assertSameLength(this.elements, o.elements);
    const end = this.elements.length;
    for (let i = 0; i !== end; ++i) {
      this.elements[i] += o.elements[i];
    }
    return this;
  }

  public subtractSelf(o: Vector): Vector {
    assertSameLength(this.elements, o.elements);
    const end = this.elements.length;
    for (let i = 0; i !== end; ++i) {
      this.elements[i] -= o.elements[i];
    }
    return this;
  }

  public scalarMultiplySelf(f: number): Vector {
    const end = this.elements.length;
    for (let i = 0; i !== end; ++i) {
      this.elements[i] *= f;
    }
    return this;
  }

  public scalarDivideSelf(f: number): Vector {
    const end = this.elements.length;
    for (let i = 0; i !== end; ++i) {
      this.elements[i] /= f;
    }
    return this;
  }

  public clone(): Vector {
    const result = new Float64Array();
    const end = this.elements.length;
    for (let i = 0; i !== end; ++i) {
      result[i] = this.elements[i];
    }
    return new Vector(result);
  }

  public assignFrom(o: Vector): Vector {
    const end = this.elements.length;
    for (let i = 0; i !== end; ++i) {
      this.elements[i] = o.elements[i];
    }
    return this;
  }
}