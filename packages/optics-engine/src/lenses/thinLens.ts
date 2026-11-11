import { Vector3 } from '../math/vector3.js';

export interface ThinLensParameters {
  /** Focal length in meters (positive = converging, negative = diverging) */
  focalLengthM: number;
  /** Clear aperture diameter in meters (e.g. 0.05m = 50mm) */
  diameterM?: number;
  /** Center position along optical axis in meters */
  positionZM: number;
}

export interface ImageConstruction {
  /** Object distance from lens do (always positive for real object in front of lens) in meters */
  objectDistanceM: number;
  /** Image distance di from lens in meters (positive = real image on opposite side, negative = virtual image on same side) */
  imageDistanceM: number;
  /** Object height in meters */
  objectHeightM: number;
  /** Image height in meters (negative = inverted) */
  imageHeightM: number;
  /** Linear transverse magnification m = -di / do */
  magnification: number;
  /** True if real image, false if virtual */
  isReal: boolean;
  /** True if inverted, false if upright */
  isInverted: boolean;
  /** True if collimated (object at focal point, di -> infinity) */
  isCollimated: boolean;
  /** 3 Principal construction rays in 3D for visualization */
  principalRays: {
    parallelRay: Vector3[];
    centralRay: Vector3[];
    focalRay: Vector3[];
  };
}

/**
 * Calculates Gaussian thin lens image construction: 1/f = 1/do + 1/di.
 *
 * @param f Focal length in meters (f > 0 converging, f < 0 diverging).
 * @param do_ Object distance in meters (do > 0).
 * @param ho Object height in meters (default 0.02m = 2cm).
 * @param lensZ Z position of the lens on the bench in meters (default 0).
 */
export function calculateThinLens(
  f: number,
  do_: number,
  ho: number = 0.02,
  lensZ: number = 0
): ImageConstruction {
  if (do_ <= 0) {
    throw new RangeError(`Object distance must be positive, got ${do_}`);
  }
  if (Math.abs(f) < 1e-6) {
    throw new Error('Focal length cannot be zero.');
  }

  // Check object at focal point (collimated beam)
  const isCollimated = Math.abs(do_ - f) < 1e-5;

  let di: number;
  let m: number;
  let hi: number;
  let isReal: boolean;
  let isInverted: boolean;

  if (isCollimated) {
    di = f > 0 ? 1e4 : -1e4; // Effective infinity
    m = di / do_;
    hi = m * ho;
    isReal = f > 0;
    isInverted = f > 0;
  } else {
    // 1/di = 1/f - 1/do = (do - f) / (f * do) => di = (f * do) / (do - f)
    di = (f * do_) / (do_ - f);
    m = -di / do_;
    hi = m * ho;
    isReal = di > 0;
    isInverted = hi < 0;
  }

  // Construct 3D Principal Rays
  // Optical axis is along +Z. Object is at Z = lensZ - do, Y = ho. Lens is at Z = lensZ.
  const objZ = lensZ - do_;
  const objPoint = new Vector3(0, ho, objZ);
  const lensCenter = new Vector3(0, 0, lensZ);
  const imgZ = lensZ + di;
  const imgPoint = new Vector3(0, hi, imgZ);

  // 1. Parallel Ray: travels parallel to axis to lens at (0, ho, lensZ), then through focal point F' at (0, 0, lensZ + f)
  const lensParallelHit = new Vector3(0, ho, lensZ);
  const parallelRay: Vector3[] = isCollimated
    ? [objPoint, lensParallelHit, new Vector3(0, ho, lensZ + 1.0)]
    : isReal
    ? [objPoint, lensParallelHit, imgPoint]
    : [
        objPoint,
        lensParallelHit,
        lensParallelHit.add(lensParallelHit.sub(imgPoint).normalize().scale(0.8)),
      ];

  // 2. Central Chief Ray: travels straight through lens center (0, 0, lensZ) undeviated
  const centralRay: Vector3[] = isReal
    ? [objPoint, lensCenter, imgPoint]
    : [
        objPoint,
        lensCenter,
        lensCenter.add(lensCenter.sub(objPoint).normalize().scale(0.8)),
      ];

  // 3. Focal Ray: travels towards front focal point F (0, 0, lensZ - f), hits lens, emerges parallel to axis
  const lensFocalHitY = isCollimated ? 0 : hi;
  const lensFocalHit = new Vector3(0, lensFocalHitY, lensZ);
  const focalRay: Vector3[] = isReal
    ? [objPoint, lensFocalHit, imgPoint]
    : [
        objPoint,
        lensFocalHit,
        new Vector3(0, hi, lensZ + 0.8),
      ];

  return {
    objectDistanceM: do_,
    imageDistanceM: di,
    objectHeightM: ho,
    imageHeightM: hi,
    magnification: m,
    isReal,
    isInverted,
    isCollimated,
    principalRays: {
      parallelRay,
      centralRay,
      focalRay,
    },
  };
}

/**
 * Calculates focal length using the thick/thin Lensmaker's equation.
 *
 * 1/f = (n - 1) * [ 1/R1 - 1/R2 + ((n - 1) * d) / (n * R1 * R2) ]
 *
 * @param n Refractive index of lens glass.
 * @param R1 Radius of curvature of front surface in meters (R > 0 if center of curvature is to the right / convex).
 * @param R2 Radius of curvature of back surface in meters (R < 0 if center of curvature is to the left / convex).
 * @param thicknessM Center thickness of the lens in meters (default 0 for thin lens approximation).
 */
export function calculateLensmakerFocalLength(
  n: number,
  R1: number,
  R2: number,
  thicknessM: number = 0
): number {
  if (n <= 1.0) {
    throw new RangeError(`Refractive index must be > 1.0, got ${n}`);
  }

  const term1 = 1.0 / R1;
  const term2 = 1.0 / R2;
  const thicknessTerm = thicknessM > 0 ? ((n - 1.0) * thicknessM) / (n * R1 * R2) : 0;

  const invF = (n - 1.0) * (term1 - term2 + thicknessTerm);
  if (Math.abs(invF) < 1e-9) {
    throw new Error('Lens surfaces result in infinite focal length (flat plate).');
  }

  return 1.0 / invF;
}
