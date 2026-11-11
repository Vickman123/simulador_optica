/**
 * Step-index optical fiber waveguide physics.
 */
export interface FiberParameters {
  coreIndex: number;
  cladIndex: number;
  coreRadiusUm: number;
  wavelengthNm: number;
  mediumIndex?: number;
}

export interface FiberCharacteristics {
  numericalAperture: number;
  acceptanceAngleDeg: number;
  criticalAngleDeg: number;
  vNumber: number;
  isSingleMode: boolean;
  approximateModeCount: number;
}

export function calculateFiber(params: FiberParameters): FiberCharacteristics {
  const { coreIndex, cladIndex, coreRadiusUm, wavelengthNm, mediumIndex = 1.0 } = params;

  if (coreIndex <= cladIndex) {
    throw new RangeError('Core refractive index must be greater than cladding refractive index for waveguiding.');
  }

  const naSq = coreIndex * coreIndex - cladIndex * cladIndex;
  const na = Math.sqrt(Math.max(0, naSq));

  const sinAcceptance = Math.min(1.0, na / mediumIndex);
  const acceptanceAngleDeg = (Math.asin(sinAcceptance) * 180.0) / Math.PI;
  const criticalAngleDeg = (Math.asin(cladIndex / coreIndex) * 180.0) / Math.PI;

  const lambdaUm = wavelengthNm / 1000.0;
  const vNumber = ((2.0 * Math.PI * coreRadiusUm) / lambdaUm) * na;
  const isSingleMode = vNumber < 2.4048;
  const approximateModeCount = isSingleMode ? 1 : Math.round((vNumber * vNumber) / 2.0);

  return {
    numericalAperture: na,
    acceptanceAngleDeg,
    criticalAngleDeg,
    vNumber,
    isSingleMode,
    approximateModeCount,
  };
}
