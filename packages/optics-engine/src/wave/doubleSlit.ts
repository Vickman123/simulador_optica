/**
 * Young's Double-Slit wave interference and single-slit Fraunhofer diffraction models.
 */

export interface DoubleSlitParameters {
  /** Wavelength in nanometers (e.g. 532 nm or 632.8 nm) */
  wavelengthNm: number;
  /** Slit center-to-center separation d in meters (e.g. 0.25mm = 0.00025m) */
  slitSeparationM: number;
  /** Individual slit width a in meters (e.g. 0.04mm = 0.00004m) */
  slitWidthM: number;
  /** Distance from double-slit mask to observation screen L in meters (e.g. 1.2m) */
  screenDistanceM: number;
  /** Source intensity I0 (arbitrary units or W/m^2, default 1.0) */
  sourceIntensity?: number;
}

export interface IntensityProfilePoint {
  /** Position on screen y in meters relative to optical axis */
  positionYM: number;
  /** Normalized intensity I / I0 (0.0 to 1.0) */
  intensity: number;
  /** Pure interference factor cos^2(delta / 2) */
  interferenceFactor: number;
  /** Pure diffraction envelope sinc^2(beta) */
  diffractionEnvelope: number;
}

export interface DoubleSlitResults {
  params: DoubleSlitParameters;
  /** Fringe spacing between consecutive interference maxima: Delta y = (lambda * L) / d in meters */
  fringeSpacingM: number;
  /** Angular fringe spacing: Delta theta = lambda / d in radians */
  angularFringeSpacingRad: number;
  /** First diffraction minimum position on screen: y_diff = (lambda * L) / a in meters */
  firstDiffractionMinimumM: number;
  /** Missing order indices where diffraction zero coincides with interference peak */
  missingOrders: number[];
  /** Discrete intensity profile sampled across screen for visualization and plotting */
  profile: IntensityProfilePoint[];
}

/**
 * Normalized cardinal sine sinc(x) = sin(pi * x) / (pi * x) or unnormalized sin(x) / x.
 * Here we use standard unnormalized sinc(u) = sin(u) / u.
 */
export function sinc(u: number): number {
  if (Math.abs(u) < 1e-7) return 1.0 - (u * u) / 6.0;
  return Math.sin(u) / u;
}

/**
 * Computes the complete spatial intensity distribution and metrics of Young's Double-Slit experiment.
 *
 * @param params Double-slit configuration parameters.
 * @param screenSpanM Total observation screen width to sample in meters (default 0.04m = 40mm).
 * @param sampleCount Number of spatial sampling points for charts and shaders (default 400).
 */
export function calculateDoubleSlit(
  params: DoubleSlitParameters,
  screenSpanM: number = 0.04,
  sampleCount: number = 400
): DoubleSlitResults {
  const {
    wavelengthNm,
    slitSeparationM,
    slitWidthM,
    screenDistanceM,
    sourceIntensity = 1.0,
  } = params;

  if (wavelengthNm <= 0 || slitSeparationM <= 0 || slitWidthM <= 0 || screenDistanceM <= 0) {
    throw new RangeError('All physical dimensions and wavelength must be positive non-zero values.');
  }

  if (slitWidthM >= slitSeparationM) {
    throw new RangeError('Slit width a cannot be greater than or equal to slit separation d.');
  }

  const lambdaM = wavelengthNm * 1e-9;
  const fringeSpacingM = (lambdaM * screenDistanceM) / slitSeparationM;
  const angularFringeSpacingRad = lambdaM / slitSeparationM;
  const firstDiffractionMinimumM = (lambdaM * screenDistanceM) / slitWidthM;

  // Find missing orders (m = p * (d / a))
  const ratio = slitSeparationM / slitWidthM;
  const missingOrders: number[] = [];
  for (let p = 1; p <= 5; p++) {
    const candidateM = Math.round(p * ratio);
    if (Math.abs(candidateM - p * ratio) < 0.01) {
      missingOrders.push(candidateM);
    }
  }

  // Generate intensity profile across [-screenSpanM / 2, +screenSpanM / 2]
  const halfSpan = screenSpanM / 2.0;
  const step = screenSpanM / (sampleCount - 1);
  const profile: IntensityProfilePoint[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const y = -halfSpan + i * step;

    // Angle theta from optical axis: sin(theta) = y / sqrt(L^2 + y^2)
    const sinTheta = y / Math.sqrt(screenDistanceM * screenDistanceM + y * y);

    // Phase difference between two slits: delta = (2 * pi / lambda) * d * sin(theta)
    const delta = ((2.0 * Math.PI) / lambdaM) * slitSeparationM * sinTheta;
    const interferenceFactor = Math.pow(Math.cos(delta / 2.0), 2);

    // Single slit diffraction phase parameter: beta = (pi / lambda) * a * sin(theta)
    const beta = ((Math.PI) / lambdaM) * slitWidthM * sinTheta;
    const sincVal = sinc(beta);
    const diffractionEnvelope = sincVal * sincVal;

    const intensity = sourceIntensity * interferenceFactor * diffractionEnvelope;

    profile.push({
      positionYM: y,
      intensity,
      interferenceFactor,
      diffractionEnvelope,
    });
  }

  return {
    params,
    fringeSpacingM,
    angularFringeSpacingRad,
    firstDiffractionMinimumM,
    missingOrders,
    profile,
  };
}
