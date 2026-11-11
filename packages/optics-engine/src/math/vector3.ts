/**
 * High-performance 3D Vector for pure scientific calculations.
 */
export class Vector3 {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0
  ) {}

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  public sub(v: Vector3): Vector3 {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  public scale(s: number): Vector3 {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  public dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public cross(v: Vector3): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  public lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public length(): number {
    return Math.sqrt(this.lengthSq());
  }

  public normalize(): Vector3 {
    const len = this.length();
    if (len === 0) return new Vector3(0, 0, 0);
    return new Vector3(this.x / len, this.y / len, this.z / len);
  }

  /**
   * Computes the specular reflection vector off a surface with given normal.
   * Both this vector and normal should be normalized.
   * r = i - 2 * (i · n) * n
   */
  public reflect(normal: Vector3): Vector3 {
    const dot = this.dot(normal);
    return this.sub(normal.scale(2 * dot)).normalize();
  }

  /**
   * Computes Snell's 3D refraction vector.
   * @param normal Surface normal unit vector pointing towards the incident medium.
   * @param n1 Refractive index of incident medium.
   * @param n2 Refractive index of transmitting medium.
   * @returns Refracted unit vector, or null if Total Internal Reflection (TIR) occurs.
   */
  public refract(normal: Vector3, n1: number, n2: number): Vector3 | null {
    const cosI = -this.dot(normal); // cos(theta1)
    const eta = n1 / n2;
    const sin2T = eta * eta * (1.0 - cosI * cosI);

    // Total Internal Reflection condition
    if (sin2T > 1.0) {
      return null;
    }

    const cosT = Math.sqrt(1.0 - sin2T);
    return this.scale(eta).add(normal.scale(eta * cosI - cosT)).normalize();
  }
}
