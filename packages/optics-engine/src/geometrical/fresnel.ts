/**
 * Fresnel Reflection and Transmission coefficients, Snell's Law, and critical angle calculations.
 */

export interface FresnelCoefficients {
  /** Incident angle in radians */
  thetaIncidentRad: number;
  /** Refracted angle in radians, or null if Total Internal Reflection */
  thetaTransmittedRad: number | null;
  /** S-polarization reflectance (0.0 to 1.0) */
  Rs: number;
  /** P-polarization reflectance (0.0 to 1.0) */
  Rp: number;
  /** Unpolarized / circular reflectance (0.0 to 1.0) */
  Runpolarized: number;
  /** S-polarization transmittance (0.0 to 1.0) */
  Ts: number;
  /** P-polarization transmittance (0.0 to 1.0) */
  Tp: number;
  /** Unpolarized transmittance (0.0 to 1.0) */
  Tunpolarized: number;
  /** True if Total Internal Reflection occurred */
  isTIR: boolean;
  /** Critical angle in radians, or null if n1 <= n2 */
  criticalAngleRad: number | null;
  /** Brewster angle in radians */
  brewsterAngleRad: number;
}

/**
 * Computes critical angle theta_c = arcsin(n2 / n1) when n1 > n2.
 * @returns Critical angle in radians, or null if n1 <= n2 (no critical angle).
 */
export function calculateCriticalAngle(n1: number, n2: number): number | null {
  if (n1 <= n2) return null;
  const ratio = n2 / n1;
  if (ratio > 1.0) return null;
  return Math.asin(ratio);
}

/**
 * Computes Brewster's angle theta_B = arctan(n2 / n1) where Rp drops to zero.
 */
export function calculateBrewsterAngle(n1: number, n2: number): number {
  return Math.atan2(n2, n1);
}

/**
 * Computes exact Fresnel reflectance and transmittance coefficients according to electromagnetic boundary conditions.
 *
 * @param thetaIncidentRad Angle of incidence relative to surface normal in radians [0, pi/2].
 * @param n1 Refractive index of incident medium.
 * @param n2 Refractive index of transmitted medium.
 */
export function calculateFresnel(
  thetaIncidentRad: number,
  n1: number,
  n2: number
): FresnelCoefficients {
  if (thetaIncidentRad < 0 || thetaIncidentRad > Math.PI / 2 + 1e-7) {
    throw new RangeError(`Incident angle must be in [0, pi/2] radians, got ${thetaIncidentRad}`);
  }

  const criticalAngle = calculateCriticalAngle(n1, n2);
  const brewsterAngle = calculateBrewsterAngle(n1, n2);

  const sinI = Math.sin(thetaIncidentRad);
  const cosI = Math.cos(thetaIncidentRad);
  const sinT = (n1 / n2) * sinI;

  // Check Total Internal Reflection (TIR)
  if (sinT >= 1.0 - 1e-9 && n1 > n2) {
    return {
      thetaIncidentRad,
      thetaTransmittedRad: null,
      Rs: 1.0,
      Rp: 1.0,
      Runpolarized: 1.0,
      Ts: 0.0,
      Tp: 0.0,
      Tunpolarized: 0.0,
      isTIR: true,
      criticalAngleRad: criticalAngle,
      brewsterAngleRad: brewsterAngle,
    };
  }

  const thetaTransmittedRad = Math.asin(Math.min(1.0, Math.max(-1.0, sinT)));
  const cosT = Math.cos(thetaTransmittedRad);

  // Normal incidence limit (theta = 0)
  if (thetaIncidentRad < 1e-6) {
    const r0 = (n1 - n2) / (n1 + n2);
    const R0 = r0 * r0;
    const T0 = 1.0 - R0;
    return {
      thetaIncidentRad,
      thetaTransmittedRad: 0,
      Rs: R0,
      Rp: R0,
      Runpolarized: R0,
      Ts: T0,
      Tp: T0,
      Tunpolarized: T0,
      isTIR: false,
      criticalAngleRad: criticalAngle,
      brewsterAngleRad: brewsterAngle,
    };
  }

  // Exact Fresnel amplitude reflection coefficients
  const rs = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
  const rp = (n2 * cosI - n1 * cosT) / (n2 * cosI + n1 * cosT);

  const Rs = rs * rs;
  const Rp = rp * rp;
  const Runpolarized = 0.5 * (Rs + Rp);

  const Ts = 1.0 - Rs;
  const Tp = 1.0 - Rp;
  const Tunpolarized = 1.0 - Runpolarized;

  return {
    thetaIncidentRad,
    thetaTransmittedRad,
    Rs,
    Rp,
    Runpolarized,
    Ts,
    Tp,
    Tunpolarized,
    isTIR: false,
    criticalAngleRad: criticalAngle,
    brewsterAngleRad: brewsterAngle,
  };
}
