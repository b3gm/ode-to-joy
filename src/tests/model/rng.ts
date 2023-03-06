export interface Rng {
  nextDouble(): number;
}

/**
 * Too lazy to find the parameters for full period. Good enough for some tests.'
 */
export class Prng implements Rng {

  private a: number = 32579;
  private b: number = 2854889;
  private c: number = 0x8fffffff;
  private x: number;

  constructor(seed: number) {
    this.x = Math.floor(Math.abs(seed)) % this.c;
  }

  /**
   * 
   * @returns pseudo random number between 0 and 1.
   */
  nextDouble(): number {
    this.x = (this.a * this.x + this.b) % this.c;
    return this.x / this.c;
  }
}
