/**
 * VOL — Vickora Optics Laboratory
 * Shared types, units, telemetry, and export data schemas.
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type UnitPrefix = 'nano' | 'micro' | 'milli' | 'centi' | 'base' | 'kilo';

/** Format a physical quantity with SI prefix and symbol */
export function formatSI(value: number, unit: string, precision: number = 3): string {
  if (value === 0) return `0 ${unit}`;
  const abs = Math.abs(value);
  if (abs >= 1e6) return `${(value / 1e6).toFixed(precision)} M${unit}`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(precision)} k${unit}`;
  if (abs >= 1) return `${value.toFixed(precision)} ${unit}`;
  if (abs >= 1e-2 && unit === 'm') return `${(value * 1e2).toFixed(precision)} cm`;
  if (abs >= 1e-3) return `${(value * 1e3).toFixed(precision)} m${unit}`;
  if (abs >= 1e-6) return `${(value * 1e6).toFixed(precision)} µ${unit}`;
  if (abs >= 1e-9) return `${(value * 1e9).toFixed(precision)} n${unit}`;
  return `${value.toExponential(precision)} ${unit}`;
}

/** Convert wavelength in nanometers to approximate RGB color for visual presentation */
export function wavelengthToRGB(wavelengthNm: number): { r: number; g: number; b: number; hex: string } {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelengthNm >= 380 && wavelengthNm < 440) {
    r = -(wavelengthNm - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelengthNm >= 440 && wavelengthNm < 490) {
    r = 0;
    g = (wavelengthNm - 440) / (490 - 440);
    b = 1;
  } else if (wavelengthNm >= 490 && wavelengthNm < 510) {
    r = 0;
    g = 1;
    b = -(wavelengthNm - 510) / (510 - 490);
  } else if (wavelengthNm >= 510 && wavelengthNm < 580) {
    r = (wavelengthNm - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelengthNm >= 580 && wavelengthNm < 645) {
    r = 1;
    g = -(wavelengthNm - 645) / (645 - 580);
    b = 0;
  } else if (wavelengthNm >= 645 && wavelengthNm <= 780) {
    r = 1;
    g = 0;
    b = 0;
  }

  // Intensity factor falloff near the vision limits (380-420 nm and 700-780 nm)
  let factor = 0;
  if (wavelengthNm >= 380 && wavelengthNm < 420) {
    factor = 0.3 + (0.7 * (wavelengthNm - 380)) / (420 - 380);
  } else if (wavelengthNm >= 420 && wavelengthNm <= 700) {
    factor = 1.0;
  } else if (wavelengthNm > 700 && wavelengthNm <= 780) {
    factor = 0.3 + (0.7 * (780 - wavelengthNm)) / (780 - 700);
  }

  const red = Math.round(Math.pow(r * factor, 0.8) * 255);
  const green = Math.round(Math.pow(g * factor, 0.8) * 255);
  const blue = Math.round(Math.pow(b * factor, 0.8) * 255);

  const hex = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
  return { r: red, g: green, b: blue, hex };
}

/** Experiment Record Schema for persistence and reports */
export interface ExperimentRecord {
  id: string;
  experimentId: string;
  title: string;
  stationId: string;
  timestamp: string;
  durationSeconds: number;
  initialConditions: Record<string, number | string | boolean>;
  measurements: Array<{
    name: string;
    symbol: string;
    value: number;
    unit: string;
    theoreticalValue?: number;
    errorPercentage?: number;
    notes?: string;
  }>;
  parameters: Record<string, number | string | boolean>;
  theoreticalSummary?: string;
  conclusions?: string;
  studentNotes?: string;
}

/** Institutional License Tier */
export type LicenseTier = 'VOL Demo' | 'VOL Academic' | 'VOL Institutional' | 'VOL XR';
