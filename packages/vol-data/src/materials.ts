import { OpticalMaterial } from './types.js';

export const OPTICAL_MATERIALS: Record<string, OpticalMaterial> = {
  vacuum: {
    id: 'vacuum',
    name: 'Vacuum',
    category: 'gas',
    source: 'Theoretical standard',
    citation: 'CODATA Recommended Values of the Fundamental Physical Constants',
    license: 'Public Domain',
    wavelengthRangeUm: [0.01, 100.0],
    temperatureC: 20,
    dispersion: {
      type: 'constant',
      coefficients: [1.0],
    },
    nd: 1.0,
    vd: Infinity,
    description: 'Empty space with unity refractive index across all wavelengths.',
  },

  air: {
    id: 'air',
    name: 'Air (15°C, 101.325 kPa)',
    category: 'gas',
    source: 'RefractiveIndex.INFO / Ciddor 1996',
    citation: 'P. E. Ciddor. Refractive index of air: new equations for the visible and near infrared, Appl. Opt. 35, 1566-1573 (1996)',
    license: 'CC0 1.0 Universal',
    wavelengthRangeUm: [0.23, 1.69],
    temperatureC: 15,
    dispersion: {
      type: 'cauchy',
      coefficients: [1.0002726, 0.00000155, 0.0],
    },
    nd: 1.000277,
    vd: 89.2,
    description: 'Standard dry air at sea level pressure and 15°C.',
  },

  water: {
    id: 'water',
    name: 'Distilled Water (H₂O, 20°C)',
    category: 'liquid',
    source: 'RefractiveIndex.INFO / Daimon & Masumura 2007',
    citation: 'M. Daimon, A. Masumura. Measurement of the refractive index of distilled water from the near-infrared to the ultraviolet, Appl. Opt. 46, 3811-3820 (2007)',
    license: 'CC0 1.0 Universal',
    wavelengthRangeUm: [0.182, 1.129],
    temperatureC: 20,
    dispersion: {
      type: 'sellmeier-1',
      // Daimon & Masumura 2007 4-term modified or simplified 3-term fit
      coefficients: [
        0.5666959820, 0.005084151894,
        0.1731900098, 0.01818488474,
        0.02095951857, 0.02625439472
      ],
    },
    nd: 1.33304,
    vd: 55.7,
    description: 'Pure liquid water at 20°C with normal optical dispersion.',
  },

  fused_silica: {
    id: 'fused_silica',
    name: 'Fused Silica (SiO₂)',
    category: 'glass',
    source: 'RefractiveIndex.INFO / Malitson 1965',
    citation: 'I. H. Malitson. Interspecimen comparison of the refractive index of fused silica, J. Opt. Soc. Am. 55, 1205-1209 (1965)',
    license: 'CC0 1.0 Universal',
    wavelengthRangeUm: [0.21, 3.71],
    temperatureC: 20,
    dispersion: {
      type: 'sellmeier-1',
      // Malitson 1965 Sellmeier coefficients (wavelength in µm)
      coefficients: [
        0.6961663, 0.0684043 * 0.0684043,
        0.4079426, 0.1162414 * 0.1162414,
        0.8974794, 9.896161 * 9.896161
      ],
    },
    nd: 1.45846,
    vd: 67.8,
    description: 'High-purity amorphous silicon dioxide with exceptional transmission from UV to near-IR.',
  },

  nbk7: {
    id: 'nbk7',
    name: 'SCHOTT N-BK7®',
    category: 'glass',
    source: 'SCHOTT Optical Glass Data Sheets 2023',
    citation: 'SCHOTT AG Advanced Optics. Optical Glass Catalog 2023, Material ID 517642.251',
    license: 'SCHOTT Public Specification / CC0 metadata',
    wavelengthRangeUm: [0.30, 2.50],
    temperatureC: 20,
    dispersion: {
      type: 'sellmeier-1',
      // Standard SCHOTT catalog Sellmeier 1 coefficients
      coefficients: [
        1.03961212, 0.00600069867,
        0.231792344, 0.0200179144,
        1.01046945, 103.560653
      ],
    },
    nd: 1.51680,
    vd: 64.17,
    description: 'Most widely used optical crown glass worldwide. Excellent homogeneity and low bubble content.',
  },

  sf11: {
    id: 'sf11',
    name: 'SCHOTT SF11®',
    category: 'glass',
    source: 'SCHOTT Optical Glass Data Sheets 2023',
    citation: 'SCHOTT AG Advanced Optics. Optical Glass Catalog 2023, Material ID 785258.541',
    license: 'SCHOTT Public Specification / CC0 metadata',
    wavelengthRangeUm: [0.37, 2.50],
    temperatureC: 20,
    dispersion: {
      type: 'sellmeier-1',
      // Standard SCHOTT catalog Sellmeier 1 coefficients
      coefficients: [
        1.73759695, 0.013188707,
        0.313747346, 0.0623068142,
        1.89878101, 155.23629
      ],
    },
    nd: 1.78472,
    vd: 25.76,
    description: 'Dense flint glass with very high dispersion and high refractive index, ideal for prism spectrometers.',
  },

  caf2: {
    id: 'caf2',
    name: 'Calcium Fluoride (CaF₂)',
    category: 'crystal',
    source: 'RefractiveIndex.INFO / Malitson 1963',
    citation: 'I. H. Malitson. A redetermination of some optical properties of calcium fluoride, Appl. Opt. 2, 1103-1107 (1963)',
    license: 'CC0 1.0 Universal',
    wavelengthRangeUm: [0.15, 9.40],
    temperatureC: 24,
    dispersion: {
      type: 'sellmeier-1',
      coefficients: [
        0.5675888, 0.050263605 * 0.050263605,
        0.4710914, 0.1003909 * 0.1003909,
        3.8484723, 34.649040 * 34.649040
      ],
    },
    nd: 1.43384,
    vd: 95.3,
    description: 'Single-crystal fluoride with very low dispersion (Abbe 95.3) and transmission from vacuum-UV to mid-IR.',
  },

  diamond: {
    id: 'diamond',
    name: 'Diamond (C)',
    category: 'gem',
    source: 'RefractiveIndex.INFO / Peter 1923',
    citation: 'F. Peter. Über die Brechungsindizes und das Absorptionsvermögen des Diamanten im Ultraviolett, Z. Phys. 15, 358-368 (1923)',
    license: 'CC0 1.0 Universal',
    wavelengthRangeUm: [0.22, 2.50],
    temperatureC: 20,
    dispersion: {
      type: 'sellmeier-1',
      coefficients: [
        0.3306, 0.175 * 0.175,
        4.3356, 0.106 * 0.106,
        0.0, 1.0
      ],
    },
    nd: 2.41726,
    vd: 55.3,
    description: 'Carbon allotrope with extreme refractive index (2.42) and high critical angle reflection.',
  },

  pmma: {
    id: 'pmma',
    name: 'Acrylic (PMMA)',
    category: 'polymer',
    source: 'RefractiveIndex.INFO / Kasarova et al. 2007',
    citation: 'S. N. Kasarova et al. Analysis of the dispersion of optical plastic materials, Opt. Mater. 29, 1481-1490 (2007)',
    license: 'CC0 1.0 Universal',
    wavelengthRangeUm: [0.40, 1.05],
    temperatureC: 20,
    dispersion: {
      type: 'cauchy',
      coefficients: [1.4792, 0.00510, 0.0],
    },
    nd: 1.4917,
    vd: 57.4,
    description: 'Polymethyl methacrylate, lightweight thermoplastic for polymer optics and consumer lenses.',
  },

  polycarbonate: {
    id: 'polycarbonate',
    name: 'Polycarbonate (PC)',
    category: 'polymer',
    source: 'RefractiveIndex.INFO / Sultanova et al. 2009',
    citation: 'N. G. Sultanova et al. Dispersion properties of optical polymers, Acta Phys. Pol. A 116, 585-587 (2009)',
    license: 'CC0 1.0 Universal',
    wavelengthRangeUm: [0.40, 1.05],
    temperatureC: 20,
    dispersion: {
      type: 'cauchy',
      coefficients: [1.5672, 0.00767, 0.00040],
    },
    nd: 1.5850,
    vd: 30.1,
    description: 'Impact-resistant optical polymer widely used in safety eyewear and high-index ophthalmic lenses.',
  },
};
