/**
 * Polarization calculus, Malus's Law, and Jones vector representations.
 */

export interface PolarizerElement {
  id: string;
  angleDeg: number;
}

export interface MalusCalculation {
  initialIntensity: number;
  finalIntensity: number;
  transmissionFraction: number;
  extinctionOccurred: boolean;
  stepIntensities: number[];
}

/**
 * Computes transmission through a sequence of linear polarizers using Malus's Law.
 *
 * @param initialIntensity Incident intensity I0 (default 1.0).
 * @param incidentAngleDeg Polarization angle of incident light in degrees.
 * @param polarizers Array of linear polarizers with transmission axis angle in degrees.
 */
export function calculateMalusCascade(
  polarizers: PolarizerElement[],
  incidentAngleDeg: number = 0,
  initialIntensity: number = 1.0
): MalusCalculation {
  if (polarizers.length === 0) {
    return {
      initialIntensity,
      finalIntensity: initialIntensity,
      transmissionFraction: 1.0,
      extinctionOccurred: false,
      stepIntensities: [initialIntensity],
    };
  }

  let currentIntensity = initialIntensity;
  let currentAngle = incidentAngleDeg;
  const stepIntensities: number[] = [initialIntensity];

  for (const pol of polarizers) {
    const diffRad = ((pol.angleDeg - currentAngle) * Math.PI) / 180.0;
    const factor = Math.cos(diffRad) * Math.cos(diffRad);
    currentIntensity *= factor;
    stepIntensities.push(currentIntensity);
    currentAngle = pol.angleDeg;
  }

  const extinctionOccurred = currentIntensity < 1e-6;

  return {
    initialIntensity,
    finalIntensity: currentIntensity,
    transmissionFraction: initialIntensity > 0 ? currentIntensity / initialIntensity : 0,
    extinctionOccurred,
    stepIntensities,
  };
}
