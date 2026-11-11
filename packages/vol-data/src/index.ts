import { OpticalMaterial } from './types.js';
import { OPTICAL_MATERIALS } from './materials.js';

export * from './types.js';
export { OPTICAL_MATERIALS } from './materials.js';

/**
 * Computes the real refractive index n for a given material and wavelength.
 *
 * @param material OpticalMaterial definition with dispersion formula.
 * @param wavelengthNm Wavelength in nanometers (e.g. 589.3 for Sodium D-line, 632.8 for He-Ne laser).
 * @param allowExtrapolation If false, throws an error when λ is outside valid experimental range.
 * @returns Refractive index n (unitless).
 */
export function getRefractiveIndex(
  material: OpticalMaterial,
  wavelengthNm: number,
  allowExtrapolation: boolean = false
): number {
  const lambdaUm = wavelengthNm / 1000.0;
  const [minUm, maxUm] = material.wavelengthRangeUm;

  if (!allowExtrapolation && (lambdaUm < minUm || lambdaUm > maxUm)) {
    throw new RangeError(
      `Wavelength ${wavelengthNm.toFixed(1)} nm (${lambdaUm.toFixed(4)} µm) is outside the valid range [${minUm} µm, ${maxUm} µm] for ${material.name}.`
    );
  }

  const { type, coefficients } = material.dispersion;

  switch (type) {
    case 'constant':
      return coefficients[0] ?? 1.0;

    case 'sellmeier-1': {
      // Standard 3-term Sellmeier: n^2 - 1 = sum_i (B_i * λ^2 / (λ^2 - C_i))
      const l2 = lambdaUm * lambdaUm;
      let sum = 0;
      for (let i = 0; i < coefficients.length; i += 2) {
        const B = coefficients[i];
        const C = coefficients[i + 1];
        if (C !== undefined) {
          sum += (B * l2) / (l2 - C);
        }
      }
      const n2 = 1.0 + sum;
      if (n2 <= 0) {
        throw new Error(`Sellmeier calculation resulted in unphysical n^2 = ${n2} for ${material.name} at ${wavelengthNm} nm.`);
      }
      return Math.sqrt(n2);
    }

    case 'cauchy': {
      // Cauchy formula: n(λ) = A + B / λ^2 + C / λ^4
      const l2 = lambdaUm * lambdaUm;
      const l4 = l2 * l2;
      const A = coefficients[0] ?? 1.0;
      const B = coefficients[1] ?? 0.0;
      const C = coefficients[2] ?? 0.0;
      return A + B / l2 + C / l4;
    }

    default:
      return material.nd;
  }
}

/**
 * Retrieve an optical material by its unique identifier.
 */
export function getMaterial(id: string): OpticalMaterial {
  const mat = OPTICAL_MATERIALS[id];
  if (!mat) {
    throw new Error(`Optical material with ID "${id}" was not found in the scientific database.`);
  }
  return mat;
}

/**
 * List all available verified optical materials.
 */
export function listMaterials(): OpticalMaterial[] {
  return Object.values(OPTICAL_MATERIALS);
}
