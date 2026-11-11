import { describe, it, expect } from 'vitest';
import {
  calculateCriticalAngle,
  calculateBrewsterAngle,
  calculateFresnel,
  calculateThinLens,
  calculateLensmakerFocalLength,
  calculateDoubleSlit,
  calculateMalusCascade,
  calculateFiber,
  calculateGratingDiffraction,
} from '../index.js';
import { getMaterial, getRefractiveIndex } from '@vickora/vol-data';

describe('1. Snell\'s Law, Critical Angle, and Fresnel Conservation', () => {
  it('correctly calculates Snell refraction angle from air into N-BK7 glass', () => {
    const n1 = 1.0;
    const n2 = 1.5168; // N-BK7 at 587.6 nm
    const thetaI = (30.0 * Math.PI) / 180.0; // 30 degrees

    const fresnel = calculateFresnel(thetaI, n1, n2);
    expect(fresnel.isTIR).toBe(false);
    expect(fresnel.thetaTransmittedRad).not.toBeNull();

    // sin(thetaT) = (n1 / n2) * sin(thetaI) = (1.0 / 1.5168) * 0.5 = 0.32964
    const expectedThetaT = Math.asin(Math.sin(thetaI) / n2);
    expect(fresnel.thetaTransmittedRad!).toBeCloseTo(expectedThetaT, 6);
  });

  it('correctly computes critical angle for internal reflection from glass to air', () => {
    const n1 = 1.5;
    const n2 = 1.0;
    const critAngle = calculateCriticalAngle(n1, n2);
    expect(critAngle).not.toBeNull();

    // theta_c = arcsin(1.0 / 1.5) = arcsin(0.666667) = 41.8103 degrees
    const critDeg = (critAngle! * 180.0) / Math.PI;
    expect(critDeg).toBeCloseTo(41.8103, 3);

    // Below critical angle: refraction occurs
    const subCrit = calculateFresnel((40.0 * Math.PI) / 180.0, n1, n2);
    expect(subCrit.isTIR).toBe(false);

    // Above critical angle: total internal reflection (TIR) occurs
    const superCrit = calculateFresnel((45.0 * Math.PI) / 180.0, n1, n2);
    expect(superCrit.isTIR).toBe(true);
    expect(superCrit.Runpolarized).toBe(1.0);
    expect(superCrit.Tunpolarized).toBe(0.0);
  });

  it('verifies exact Brewster angle where p-polarized reflection drops to zero', () => {
    const n1 = 1.0;
    const n2 = 1.5;
    const brewster = calculateBrewsterAngle(n1, n2);
    // theta_B = arctan(1.5 / 1.0) = 56.3099 degrees
    const brewsterDeg = (brewster * 180.0) / Math.PI;
    expect(brewsterDeg).toBeCloseTo(56.3099, 3);

    const fresnelBrewster = calculateFresnel(brewster, n1, n2);
    expect(fresnelBrewster.Rp).toBeLessThan(1e-10); // Rp = 0 at Brewster's angle
    expect(fresnelBrewster.Tp).toBeCloseTo(1.0, 5);
  });

  it('verifies energy conservation R + T = 1 across diverse incident angles', () => {
    const n1 = 1.0;
    const n2 = 1.6;
    for (let deg = 0; deg <= 85; deg += 5) {
      const rad = (deg * Math.PI) / 180.0;
      const res = calculateFresnel(rad, n1, n2);
      expect(res.Rs + res.Ts).toBeCloseTo(1.0, 6);
      expect(res.Rp + res.Tp).toBeCloseTo(1.0, 6);
      expect(res.Runpolarized + res.Tunpolarized).toBeCloseTo(1.0, 6);
    }
  });
});

describe('2. Thin Lens & Lensmaker Equations', () => {
  it('accurately calculates real inverted image position and magnification for converging lens', () => {
    const f = 0.1; // 100 mm = 0.1 m focal length
    const do_ = 0.25; // 250 mm object distance
    const ho = 0.02; // 20 mm object height

    // 1/di = 1/0.1 - 1/0.25 = 10 - 4 = 6 => di = 1/6 = 0.16667 m
    const result = calculateThinLens(f, do_, ho);
    expect(result.isReal).toBe(true);
    expect(result.isInverted).toBe(true);
    expect(result.imageDistanceM).toBeCloseTo(0.166667, 5);

    // Magnification m = -di / do = -0.166667 / 0.25 = -0.66667
    expect(result.magnification).toBeCloseTo(-0.666667, 5);
    expect(result.imageHeightM).toBeCloseTo(-0.013333, 5);
  });

  it('accurately constructs virtual upright image when object is inside focal point', () => {
    const f = 0.1; // 100 mm focal length
    const do_ = 0.05; // 50 mm object distance (inside f)
    const ho = 0.02;

    // 1/di = 1/0.1 - 1/0.05 = 10 - 20 = -10 => di = -0.1 m
    const result = calculateThinLens(f, do_, ho);
    expect(result.isReal).toBe(false);
    expect(result.isInverted).toBe(false);
    expect(result.imageDistanceM).toBeCloseTo(-0.1, 5);
    expect(result.magnification).toBeCloseTo(2.0, 5); // Magnifying glass effect (2x magnification)
  });

  it('correctly predicts image for diverging lens (f < 0)', () => {
    const f = -0.15; // -150 mm diverging lens
    const do_ = 0.3; // 300 mm object distance
    const result = calculateThinLens(f, do_, 0.02);
    expect(result.isReal).toBe(false);
    expect(result.isInverted).toBe(false);
    expect(result.imageDistanceM).toBeLessThan(0);
    expect(result.magnification).toBeGreaterThan(0);
    expect(result.magnification).toBeLessThan(1.0); // Demagnified upright virtual image
  });

  it('computes lensmaker focal length for biconvex N-BK7 lens', () => {
    const n = 1.5168; // N-BK7
    const R1 = 0.1; // 100 mm radius front
    const R2 = -0.1; // -100 mm radius back
    // 1/f = (1.5168 - 1) * (1/0.1 - (-1/0.1)) = 0.5168 * 20 = 10.336 => f = 0.09675 m (96.75 mm)
    const f = calculateLensmakerFocalLength(n, R1, R2);
    expect(f).toBeCloseTo(0.09675, 4);
  });
});

describe('3. Sellmeier Dispersion & Material Database', () => {
  it('reproduces standard SCHOTT N-BK7 refractive index at Fraunhofer lines', () => {
    const nbk7 = getMaterial('nbk7');
    // d-line (587.56 nm) standard Schott value is 1.51680
    const nd = getRefractiveIndex(nbk7, 587.56);
    expect(nd).toBeCloseTo(1.5168, 4);

    // C-line (656.27 nm) red
    const nC = getRefractiveIndex(nbk7, 656.27);
    expect(nC).toBeLessThan(nd);

    // F-line (486.13 nm) blue
    const nF = getRefractiveIndex(nbk7, 486.13);
    expect(nF).toBeGreaterThan(nd);

    // Normal dispersion check: dn/dlambda < 0 across visible spectrum
    expect(nF).toBeGreaterThan(nC);
  });

  it('reproduces Fused Silica Malitson Sellmeier values', () => {
    const silica = getMaterial('fused_silica');
    const n532 = getRefractiveIndex(silica, 532.0); // Green laser
    expect(n532).toBeCloseTo(1.4607, 3);
  });

  it('throws RangeError when wavelength is outside valid range without extrapolation', () => {
    const nbk7 = getMaterial('nbk7');
    // Valid range is [0.30, 2.50] um -> 100 nm (0.10 um) is invalid UV
    expect(() => getRefractiveIndex(nbk7, 100)).toThrow(RangeError);
  });
});

describe('4. Young\'s Double-Slit Wave Interference', () => {
  it('correctly calculates fringe spacing Delta y = (lambda * L) / d', () => {
    const wavelengthNm = 632.8; // He-Ne laser (nm)
    const slitSeparationM = 0.00025; // 0.25 mm
    const slitWidthM = 0.00004; // 0.04 mm
    const screenDistanceM = 1.5; // 1.5 m

    const result = calculateDoubleSlit({
      wavelengthNm,
      slitSeparationM,
      slitWidthM,
      screenDistanceM,
    });

    // Delta y = (632.8e-9 * 1.5) / 0.00025 = 0.0037968 m = 3.7968 mm
    expect(result.fringeSpacingM).toBeCloseTo(0.0037968, 6);

    // Angular fringe spacing Delta theta = lambda / d = 632.8e-9 / 0.00025 = 0.0025312 rad
    expect(result.angularFringeSpacingRad).toBeCloseTo(0.0025312, 6);
  });

  it('identifies missing orders in double slit pattern', () => {
    const result = calculateDoubleSlit({
      wavelengthNm: 532,
      slitSeparationM: 0.00020, // 0.20 mm
      slitWidthM: 0.00005,       // 0.05 mm -> ratio d/a = 4
      screenDistanceM: 1.0,
    });

    // Missing order m = 4 * 1 = 4, 8, etc.
    expect(result.missingOrders).toContain(4);
  });
});

describe('5. Polarization & Malus\'s Law', () => {
  it('verifies Malus\'s law for two crossed polarizers (zero intensity at 90 deg)', () => {
    const polarizers = [
      { id: 'p1', angleDeg: 0 },
      { id: 'p2', angleDeg: 90 },
    ];
    const res = calculateMalusCascade(polarizers, 0, 1.0);
    expect(res.finalIntensity).toBeCloseTo(0.0, 7);
    expect(res.extinctionOccurred).toBe(true);
  });

  it('verifies 3-polarizer paradox (inserting 45 deg polarizer between crossed polarizers transmits 25% of light)', () => {
    const polarizers = [
      { id: 'p1', angleDeg: 0 },
      { id: 'p2', angleDeg: 45 },
      { id: 'p3', angleDeg: 90 },
    ];
    const res = calculateMalusCascade(polarizers, 0, 1.0);
    // After P1: I = 1.0
    // After P2 (45 deg): I = cos^2(45) = 0.5
    // After P3 (90 deg): I = 0.5 * cos^2(45) = 0.25 (25% transmission)
    expect(res.finalIntensity).toBeCloseTo(0.25, 6);
    expect(res.extinctionOccurred).toBe(false);
  });
});

describe('6. Photonics Waveguide & Grating Spectroscopy', () => {
  it('correctly calculates optical fiber Numerical Aperture NA = sqrt(n_core^2 - n_clad^2)', () => {
    const coreIndex = 1.48;
    const cladIndex = 1.46;
    const fiber = calculateFiber({
      coreIndex,
      cladIndex,
      coreRadiusUm: 2.0,
      wavelengthNm: 1550,
    });

    // NA = sqrt(1.48^2 - 1.46^2) = sqrt(2.1904 - 2.1316) = sqrt(0.0588) = 0.242487
    expect(fiber.numericalAperture).toBeCloseTo(0.242487, 5);
    expect(fiber.isSingleMode).toBe(true);
  });

  it('computes grating diffraction angle for 600 lines/mm grating', () => {
    const peaks = calculateGratingDiffraction(
      { grooveDensityLinesPerMm: 600, incidentAngleDeg: 0, order: 1 },
      [532, 632.8]
    );

    expect(peaks[0].diffractedAngleDeg).not.toBeNull();
    // d = 1/600 mm = 1.6667e-6 m
    // sin(beta) = 532e-9 / 1.6667e-6 = 0.3192 => beta = 18.61 degrees
    expect(peaks[0].diffractedAngleDeg!).toBeCloseTo(18.614, 2);

    // For 632.8 nm: sin(beta) = 632.8e-9 / 1.6667e-6 = 0.37968 => beta = 22.31 degrees
    expect(peaks[1].diffractedAngleDeg!).toBeCloseTo(22.315, 2);
  });
});
