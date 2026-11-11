/**
 * Diffraction grating spectrometer model.
 */
export interface GratingParameters {
  grooveDensityLinesPerMm: number; // e.g. 600 lines/mm
  incidentAngleDeg: number;       // default 0 (normal)
  order: number;                  // diffraction order m (default 1)
}

export interface SpectralPeak {
  wavelengthNm: number;
  label?: string;
  diffractedAngleDeg: number | null;
}

export function calculateGratingDiffraction(
  params: GratingParameters,
  wavelengthsNm: number[]
): SpectralPeak[] {
  const { grooveDensityLinesPerMm, incidentAngleDeg, order } = params;
  const dMeters = 1e-3 / grooveDensityLinesPerMm; // Grating period d in meters
  const alphaRad = (incidentAngleDeg * Math.PI) / 180.0;
  const sinAlpha = Math.sin(alphaRad);

  return wavelengthsNm.map((wl) => {
    const lambdaMeters = wl * 1e-9;
    // d * (sin(alpha) + sin(beta)) = m * lambda => sin(beta) = (m * lambda / d) - sin(alpha)
    const sinBeta = (order * lambdaMeters) / dMeters - sinAlpha;

    if (Math.abs(sinBeta) > 1.0) {
      return { wavelengthNm: wl, diffractedAngleDeg: null };
    }

    const betaRad = Math.asin(sinBeta);
    return {
      wavelengthNm: wl,
      diffractedAngleDeg: (betaRad * 180.0) / Math.PI,
    };
  });
}
