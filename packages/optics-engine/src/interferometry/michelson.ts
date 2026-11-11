/**
 * Michelson Interferometer idealized optical path and fringe calculation.
 */
export interface MichelsonParameters {
  wavelengthNm: number;
  fixedArmLengthM: number;
  movableArmLengthM: number;
  sourceIntensity?: number;
}

export interface MichelsonResult {
  opticalPathDifferenceM: number;
  phaseDifferenceRad: number;
  centralIntensity: number;
  fringeCountShift: number;
}

export function calculateMichelson(params: MichelsonParameters): MichelsonResult {
  const { wavelengthNm, fixedArmLengthM, movableArmLengthM, sourceIntensity = 1.0 } = params;
  const lambdaM = wavelengthNm * 1e-9;

  // Round trip OPD: Delta = 2 * |d1 - d2|
  const opd = 2 * Math.abs(movableArmLengthM - fixedArmLengthM);
  const phaseDiff = ((2 * Math.PI) / lambdaM) * opd;
  const centralIntensity = sourceIntensity * Math.pow(Math.cos(phaseDiff / 2.0), 2);
  const fringeCountShift = opd / lambdaM;

  return {
    opticalPathDifferenceM: opd,
    phaseDifferenceRad: phaseDiff,
    centralIntensity,
    fringeCountShift,
  };
}
