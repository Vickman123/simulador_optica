import { Vector3 } from '../math/vector3.js';
import { OpticalMaterial, getRefractiveIndex } from '@vickora/vol-data';

export interface PrismTraceResult {
  wavelengthNm: number;
  refractiveIndex: number;
  entryPoint: Vector3;
  exitPoint: Vector3;
  incidentRay: Vector3[];
  internalRay: Vector3[];
  exitRay: Vector3[];
  deviationAngleRad: number;
  isTIR: boolean;
}

/**
 * Traces a ray through an equilateral or isosceles prism in the X-Z plane.
 *
 * @param apexAngleDeg Apex angle of the prism in degrees (commonly 60°).
 * @param sideLengthM Length of the prism faces in meters (e.g. 0.05m = 5cm).
 * @param material OpticalMaterial of the prism (e.g. SF11 or N-BK7).
 * @param wavelengthNm Incident light wavelength in nanometers.
 * @param incidentAngleDeg Angle of incidence at face 1 relative to normal in degrees.
 */
export function tracePrism(
  apexAngleDeg: number = 60,
  sideLengthM: number = 0.05,
  material: OpticalMaterial,
  wavelengthNm: number = 589.3,
  incidentAngleDeg: number = 45
): PrismTraceResult {
  const alpha = (apexAngleDeg * Math.PI) / 180.0;
  const theta1 = (incidentAngleDeg * Math.PI) / 180.0;
  const n = getRefractiveIndex(material, wavelengthNm);

  // Face 1 refraction: sin(theta1) = n * sin(r1)
  const sinR1 = Math.sin(theta1) / n;
  if (Math.abs(sinR1) > 1.0) {
    throw new Error('Total reflection on entering prism face is unphysical for n > 1');
  }
  const r1 = Math.asin(sinR1);

  // Internal geometry: r2 = alpha - r1
  const r2 = alpha - r1;

  // Face 2 refraction: n * sin(r2) = sin(theta2)
  const sinTheta2 = n * Math.sin(r2);
  const isTIR = Math.abs(sinTheta2) >= 1.0;

  let theta2 = 0;
  let deviationAngleRad = 0;

  if (!isTIR) {
    theta2 = Math.asin(Math.max(-1.0, Math.min(1.0, sinTheta2)));
    // Total angular deviation: delta = theta1 + theta2 - alpha
    deviationAngleRad = theta1 + theta2 - alpha;
  } else {
    deviationAngleRad = Math.PI - 2 * r2;
  }

  // 3D coordinates centered at origin
  const halfBase = (sideLengthM * Math.sin(alpha / 2));
  const height = sideLengthM * Math.cos(alpha / 2);

  const entry = new Vector3(-halfBase * 0.5, 0, -height * 0.2);
  const exit = new Vector3(halfBase * 0.5, 0, -height * 0.2);

  const inDir = new Vector3(Math.cos(theta1), 0, Math.sin(theta1)).normalize();
  const outDir = new Vector3(Math.cos(theta2), 0, Math.sin(theta2)).normalize();

  return {
    wavelengthNm,
    refractiveIndex: n,
    entryPoint: entry,
    exitPoint: exit,
    incidentRay: [entry.sub(inDir.scale(0.1)), entry],
    internalRay: [entry, exit],
    exitRay: [exit, exit.add(outDir.scale(0.15))],
    deviationAngleRad,
    isTIR,
  };
}

/**
 * Traces a spectral dispersion bundle across the visible spectrum (380 nm to 750 nm).
 */
export function tracePrismDispersion(
  material: OpticalMaterial,
  wavelengthsNm: number[] = [405, 488, 532, 589, 633, 670],
  apexAngleDeg: number = 60,
  incidentAngleDeg: number = 50
): PrismTraceResult[] {
  return wavelengthsNm.map((wl) =>
    tracePrism(apexAngleDeg, 0.06, material, wl, incidentAngleDeg)
  );
}
