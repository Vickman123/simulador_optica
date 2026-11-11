/**
 * Optical Material Schema according to RefractiveIndex.INFO conventions and SCHOTT glass catalog.
 */

export type DispersionModelType =
  | 'constant'
  | 'sellmeier-1'     // n^2 - 1 = B1*λ^2/(λ^2 - C1) + B2*λ^2/(λ^2 - C2) + B3*λ^2/(λ^2 - C3)
  | 'sellmeier-2'
  | 'cauchy'          // n = A + B/λ^2 + C/λ^4
  | 'tabulated';

export interface DispersionFormula {
  type: DispersionModelType;
  /** Coefficients according to formula definition (wavelength λ in micrometers µm) */
  coefficients: number[];
}

export interface TabulatedDataPoint {
  /** Wavelength in micrometers (µm) */
  wavelengthUm: number;
  /** Real refractive index */
  n: number;
  /** Extinction coefficient (optional) */
  k?: number;
}

export interface OpticalMaterial {
  id: string;
  name: string;
  category: 'gas' | 'liquid' | 'glass' | 'crystal' | 'polymer' | 'gem';
  source: string;
  citation: string;
  license: string;
  /** Valid range in micrometers [min, max] */
  wavelengthRangeUm: [number, number];
  temperatureC: number;
  dispersion: DispersionFormula;
  tabulated?: TabulatedDataPoint[];
  /** Reference refractive index at Fraunhofer d-line (587.56 nm) */
  nd: number;
  /** Abbe number Vd = (nd - 1)/(nF - nC) */
  vd?: number;
  description: string;
}
