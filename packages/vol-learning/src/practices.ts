import { UniversityLabPractice } from './types.js';

export const LAB_PRACTICES: Record<string, UniversityLabPractice> = {
  // PRACTICE 1: Reflection, Refraction & Snell's Law
  'exp-snell': {
    id: 'exp-snell',
    stationId: 'geometric',
    status: 'active',
    title: 'Verification of Snell’s Law, Fresnel Coefficients, and Total Internal Reflection',
    academicLevel: 'Undergraduate Physics II',
    learningObjectives: [
      'Empirically verify Snell’s Law of refraction at planar dielectric boundaries.',
      'Measure the critical angle for total internal reflection (TIR) and compute the relative index of refraction.',
      'Observe Brewster’s angle where p-polarized reflection drops to zero.',
      'Quantify the conservation of energy in reflection and transmission (Rs + Ts = 1).',
    ],
    theory: `When an optical wave encounters the boundary separating two transparent media of refractive indices n₁ and n₂, part of the energy reflects back into the first medium at an angle equal to the incident angle (θ_r = θ_i), while part transmits into the second medium following Snell's Law: n₁ sin(θ_i) = n₂ sin(θ_t).
    
    When transitioning from a denser medium to a rarer medium (n₁ > n₂), there exists a critical angle θ_c = arcsin(n₂ / n₁) beyond which all light undergoes Total Internal Reflection. Furthermore, at Brewster's angle θ_B = arctan(n₂ / n₁), the reflected beam is purely s-polarized because the dipole oscillations in the transmitted medium point directly along the reflection direction.`,
    instruments: [
      'Precision optical bench rail',
      'Collimated tunable monochromatic laser (532 nm / 632.8 nm)',
      'High-precision rotating goniometer mount (0.1° accuracy)',
      'Semi-cylindrical glass block (SCHOTT N-BK7® and Fused Silica)',
      'Digital dual-channel photodetector power meter',
    ],
    safety: [
      'Class 3R laser in use: Avoid direct ocular beam exposure.',
      'Wear calibrated OD4+ laser safety goggles matched to beam wavelength.',
      'Ensure all beam reflections terminate in certified beam dumps or matte card screens.',
    ],
    setupDescription: 'Mount the semi-cylindrical glass block at the center of the graduated goniometer table. Align the laser beam along the 0° optical axis such that it strikes the planar entrance face at the precise center of curvature.',
    procedure: [
      {
        stepNumber: 1,
        title: 'System Alignment',
        instruction: 'Turn on the laser source at 632.8 nm (He-Ne red). Verify that the beam strikes normal to the goniometer center at 0° incidence.',
      },
      {
        stepNumber: 2,
        title: 'Snell Angular Sweep',
        instruction: 'Rotate the goniometer from 0° to 60° in 10° increments. Record the refracted angle θ_t inside the dielectric medium for each step.',
      },
      {
        stepNumber: 3,
        title: 'Critical Angle Measurement',
        instruction: 'Reverse the optical orientation (light entering the curved face toward the flat interface from within the glass). Slowly increase θ_i until the transmitted ray grazes the flat surface at 90° and disappears.',
      },
      {
        stepNumber: 4,
        title: 'Brewster Angle & Polarization',
        instruction: 'Switch polarization to P-polarized mode. Rotate the incident angle around 56° for N-BK7 and observe the photodetector reading of the reflected ray.',
      },
    ],
    configurableVariables: [
      {
        name: 'Incident Angle',
        key: 'incidentAngleDeg',
        unit: 'degrees',
        min: 0,
        max: 85,
        step: 0.5,
        defaultValue: 30,
      },
      {
        name: 'Laser Wavelength',
        key: 'wavelengthNm',
        unit: 'nm',
        min: 405,
        max: 670,
        step: 1,
        defaultValue: 632.8,
      },
      {
        name: 'Material',
        key: 'materialId',
        unit: 'material',
        min: 0,
        max: 0,
        step: 1,
        defaultValue: 'nbk7',
      },
    ],
    measurementFields: [
      { name: 'Incident Angle', symbol: 'θ_i', unit: '°' },
      { name: 'Refracted Angle', symbol: 'θ_t', unit: '°' },
      { name: 'Reflected Intensity', symbol: 'R', unit: 'fraction' },
      { name: 'Transmitted Intensity', symbol: 'T', unit: 'fraction' },
      { name: 'Experimental Index', symbol: 'n_exp', unit: '' },
    ],
    mathematicalModel: [
      'Snell’s Law: n₁ · sin(θ_i) = n₂ · sin(θ_t)',
      'Critical Angle: θ_c = arcsin(n₂ / n₁)',
      'Brewster Angle: θ_B = arctan(n₂ / n₁)',
      'Fresnel Reflectance: R_s = |(n₁ cos θ_i - n₂ cos θ_t)/(n₁ cos θ_i + n₂ cos θ_t)|²',
      'Fresnel Reflectance: R_p = |(n₂ cos θ_i - n₁ cos θ_t)/(n₂ cos θ_i + n₁ cos θ_t)|²',
    ],
    expectedResults: 'For SCHOTT N-BK7 at 632.8 nm (n ≈ 1.515), the critical angle when exiting into air is θ_c ≈ 41.3°. The Brewster angle is θ_B ≈ 56.57° where Rp reaches 0.',
    analysisGuidelines: 'Plot sin(θ_i) versus sin(θ_t). Perform a linear regression fit; the slope yields the refractive index ratio n₂ / n₁. Calculate the percentage discrepancy against the theoretical Sellmeier value.',
    discussionQuestions: [
      'Why does total internal reflection occur only when propagating from a higher index medium to a lower index medium?',
      'How does the dispersion dn/dλ affect the critical angle as the laser wavelength changes from 405 nm (violet) to 670 nm (red)?',
      'Explain the physical origin of Brewster’s angle in terms of electron oscillating dipoles in the dielectric.',
    ],
    conclusions: 'The experiment confirms Snell’s Law and validates Fresnel energy conservation. The measured index closely matches the SCHOTT catalog Sellmeier dispersion within <0.2% margin.',
    challenges: [
      {
        id: 'snell-challenge-1',
        title: 'The Brewster Null',
        description: 'Adjust the incident angle to locate Brewster’s angle for N-BK7 where reflected p-polarized intensity is minimized below 0.001.',
        targetMetric: 'reflectedIntensity',
        targetValue: 0.0,
        tolerance: 0.002,
        initialParams: { incidentAngleDeg: 40, wavelengthNm: 632.8, materialId: 'nbk7' },
        solutionExplanation: 'Brewster’s angle for N-BK7 (n = 1.515) is arctan(1.515) ≈ 56.57°. At this angle, Rp = 0.',
      },
    ],
  },

  // PRACTICE 2: Thin Lens Systems & Image Construction
  'exp-lenses': {
    id: 'exp-lenses',
    stationId: 'lenses',
    status: 'active',
    title: 'Geometrical Optics: Image Construction, Thin Lens Formula, and Magnification',
    academicLevel: 'Undergraduate Physics I',
    learningObjectives: [
      'Measure object distance d_o and image distance d_i on an optical bench.',
      'Verify the Gaussian thin lens equation 1/f = 1/d_o + 1/d_i.',
      'Determine the focal length of converging and diverging lenses.',
      'Analyze real vs. virtual images and verify transverse magnification m = -d_i / d_o.',
    ],
    theory: `The paraxial behavior of a thin spherical lens is governed by the Gaussian lens formula:
    1/f = 1/d_o + 1/d_i
    where f is the focal length (positive for converging lenses, negative for diverging lenses), d_o is the distance from the object to the lens, and d_i is the distance from the lens to the image.
    
    The transverse magnification m = h_i / h_o = -d_i / d_o. A positive d_i corresponds to a real image that can be formed on a physical screen, whereas a negative d_i corresponds to a virtual image that cannot be cast onto a screen and is erect.`,
    instruments: [
      'Precision aluminum optical rail (1.5 m) with metric millimeter graduation',
      'Adjustable illuminated object target (F-pattern / grid with millimeter scale)',
      'Optical carriers with micrometer elevation adjusters',
      'Mounted biconvex lens (f = +100 mm)',
      'Mounted plano-concave lens (f = -150 mm)',
      'Ground glass observation projection screen',
    ],
    safety: [
      'Illumination source produces localized heat: Do not obstruct ventilation louvers.',
      'Handle optical lenses only by their anodized metal cell collars to prevent finger smudges.',
    ],
    setupDescription: 'Place the illuminated object at the 0 cm mark on the optical rail. Mount the converging lens in a carrier at position Z = 30 cm. Mount the observation screen down the rail beyond the lens.',
    procedure: [
      {
        stepNumber: 1,
        title: 'Collimation Test (Infinite Conjugate)',
        instruction: 'Position the object exactly at the focal distance d_o = f = 100 mm. Observe that the emerging rays form a parallel collimated cylinder.',
      },
      {
        stepNumber: 2,
        title: 'Real Image Formation',
        instruction: 'Place the object at d_o = 250 mm. Slide the screen along the rail until the projected target pattern is sharply focused. Record d_i and measure the inverted image height h_i.',
      },
      {
        stepNumber: 3,
        title: '2f Symmetric Conjugate',
        instruction: 'Set d_o = 2f = 200 mm. Locate the screen position. Confirm that d_i = 2f = 200 mm and magnification m = -1.0 (equal size, inverted).',
      },
      {
        stepNumber: 4,
        title: 'Magnifying Glass Regime (d_o < f)',
        instruction: 'Move the object inside the focal distance (d_o = 60 mm). Notice that no real image forms on the screen; a magnified virtual image appears behind the lens.',
      },
    ],
    configurableVariables: [
      {
        name: 'Focal Length (f)',
        key: 'focalLengthMm',
        unit: 'mm',
        min: -200,
        max: 300,
        step: 5,
        defaultValue: 100,
      },
      {
        name: 'Object Distance (d_o)',
        key: 'objectDistanceMm',
        unit: 'mm',
        min: 20,
        max: 600,
        step: 1,
        defaultValue: 250,
      },
      {
        name: 'Object Height (h_o)',
        key: 'objectHeightMm',
        unit: 'mm',
        min: 5,
        max: 50,
        step: 1,
        defaultValue: 20,
      },
    ],
    measurementFields: [
      { name: 'Object Distance', symbol: 'd_o', unit: 'mm' },
      { name: 'Image Distance', symbol: 'd_i', unit: 'mm' },
      { name: 'Image Height', symbol: 'h_i', unit: 'mm' },
      { name: 'Magnification', symbol: 'm', unit: '' },
      { name: 'Calculated Focal Length', symbol: 'f_calc', unit: 'mm' },
    ],
    mathematicalModel: [
      'Gaussian Lens Formula: 1/f = 1/d_o + 1/d_i',
      'Image Distance: d_i = (f · d_o) / (d_o - f)',
      'Magnification: m = -d_i / d_o = h_i / h_o',
      'Lensmaker’s Formula: 1/f = (n - 1) · [1/R₁ - 1/R₂]',
    ],
    expectedResults: 'With f = 100 mm and d_o = 250 mm: d_i = (100 · 250) / 150 = 166.7 mm. Magnification m = -166.7 / 250 = -0.667. The image is real, inverted, and 13.3 mm tall.',
    analysisGuidelines: 'Plot 1/d_i versus 1/d_o. The graph should be a straight line with slope -1 and y-intercept 1/f. Determine f from the intercept and compare with the nominal lens specification.',
    discussionQuestions: [
      'What happens to the image distance and magnification as the object approaches the focal point from the left?',
      'Why can a single diverging lens (f < 0) never produce a real image from a real object?',
      'How does spherical aberration in a thick lens cause paraxial rays and marginal rays to focus at different points?',
    ],
    conclusions: 'The experiment demonstrates the thin lens equation and verifies the transition between real inverted images and virtual erect magnified images.',
    challenges: [
      {
        id: 'lens-challenge-1',
        title: 'The 2X Projector',
        description: 'Configure a converging lens system to produce a real inverted image that is exactly twice as large as the object (|m| = 2.0).',
        targetMetric: 'magnification',
        targetValue: -2.0,
        tolerance: 0.05,
        initialParams: { focalLengthMm: 100, objectDistanceMm: 300, objectHeightMm: 20 },
        solutionExplanation: 'For |m| = 2 with real image, d_i = 2 * d_o. Substituting into 1/f = 1/d_o + 1/(2 d_o) = 3/(2 d_o) gives d_o = 1.5 * f = 150 mm.',
      },
    ],
  },

  // PRACTICE 3: Young's Double-Slit Experiment
  'exp-doubleslit': {
    id: 'exp-doubleslit',
    stationId: 'wave',
    status: 'active',
    title: 'Wave Optics: Young’s Double-Slit Interference and Fraunhofer Diffraction',
    academicLevel: 'Undergraduate Physics II',
    learningObjectives: [
      'Demonstrate the wave nature of light through spatial interference fringe patterns.',
      'Determine an unknown laser wavelength by measuring the fringe spacing Δy.',
      'Analyze the interplay between double-slit interference fringes and the single-slit diffraction envelope.',
      'Identify missing orders in diffraction patterns and compute the slit width a and separation d.',
    ],
    theory: `Thomas Young's double-slit experiment (1801) was decisive proof of the wave theory of light. Two parallel narrow slits separated by distance d act as coherent cylindrical wave sources.
    
    The path difference between the waves arriving at angle θ on a distant screen is Δs = d sin(θ).
    Constructive interference (bright fringes) occurs when d sin(θ) = m λ, where m = 0, ±1, ±2, ...
    In the small angle paraxial approximation (sin θ ≈ tan θ = y / L), the fringe spacing between adjacent maxima is:
    Δy = (λ · L) / d
    
    The overall spatial intensity distribution incorporates the single-slit diffraction envelope of width a:
    I(y) = I₀ · cos²(π d sin θ / λ) · sinc²(π a sin θ / λ)`,
    instruments: [
      'Stable optical rail with metric scale',
      'CW green diode laser (532 nm, TEM00 mode, <1 mW)',
      'Precision double-slit aperture slide (photolithographic chromium on quartz)',
      'Diffraction observation screen with calibrated millimeter reticle',
      'Digital linear CCD profile scanner',
    ],
    safety: [
      'Green 532 nm laser: High retinal sensitivity. Do not look directly into beam.',
      'Keep the beam line at waist level and never elevate mirrors above eye level.',
    ],
    setupDescription: 'Mount the laser at the rail origin. Mount the double-slit slide (d = 0.25 mm, a = 0.04 mm) at Z = 20 cm. Mount the observation screen at Z = 1.4 m (L = 1.2 m from slits).',
    procedure: [
      {
        stepNumber: 1,
        title: 'Laser Alignment',
        instruction: 'Direct the laser beam to illuminate both slits symmetrically. Center the primary diffraction pattern on the observation screen.',
      },
      {
        stepNumber: 2,
        title: 'Fringe Spacing Measurement',
        instruction: 'Measure the distance across 10 bright fringes (10 Δy) using the reticle. Compute the average single fringe spacing Δy.',
      },
      {
        stepNumber: 3,
        title: 'Distance Dependence (L variation)',
        instruction: 'Vary the screen distance L from 0.8 m to 1.6 m in steps of 0.2 m. Plot Δy versus L to verify linear proportionality.',
      },
      {
        stepNumber: 4,
        title: 'Diffraction Envelope & Missing Orders',
        instruction: 'Observe the fading of fringes at the first diffraction minimum. Note which interference order m is missing.',
      },
    ],
    configurableVariables: [
      {
        name: 'Wavelength (λ)',
        key: 'wavelengthNm',
        unit: 'nm',
        min: 405,
        max: 670,
        step: 1,
        defaultValue: 532,
      },
      {
        name: 'Slit Separation (d)',
        key: 'slitSeparationMm',
        unit: 'mm',
        min: 0.1,
        max: 1.0,
        step: 0.05,
        defaultValue: 0.25,
      },
      {
        name: 'Slit Width (a)',
        key: 'slitWidthMm',
        unit: 'mm',
        min: 0.02,
        max: 0.1,
        step: 0.01,
        defaultValue: 0.04,
      },
      {
        name: 'Screen Distance (L)',
        key: 'screenDistanceM',
        unit: 'm',
        min: 0.5,
        max: 2.5,
        step: 0.1,
        defaultValue: 1.2,
      },
    ],
    measurementFields: [
      { name: 'Fringe Spacing', symbol: 'Δy', unit: 'mm' },
      { name: 'Angular Spacing', symbol: 'Δθ', unit: 'mrad' },
      { name: 'First Diffraction Minimum', symbol: 'y_diff', unit: 'mm' },
      { name: 'Calculated Wavelength', symbol: 'λ_calc', unit: 'nm' },
    ],
    mathematicalModel: [
      'Constructive Interference Condition: d · sin(θ) = m · λ',
      'Paraxial Fringe Spacing: Δy = (λ · L) / d',
      'Single-Slit Minima Condition: a · sin(θ) = p · λ (p = 1, 2, ...)',
      'Total Intensity: I(y) = I₀ · cos²(π d sin θ / λ) · [sin(π a sin θ / λ) / (π a sin θ / λ)]²',
    ],
    expectedResults: 'For λ = 532 nm, d = 0.25 mm, L = 1.2 m: Δy = (532e-9 · 1.2) / 0.00025 = 2.5536 mm. The first diffraction minimum occurs at y = (532e-9 · 1.2) / 0.00004 = 15.96 mm.',
    analysisGuidelines: 'Using the measured Δy and known d and L, calculate λ = (d · Δy) / L. Compute the standard deviation and error percentage relative to the nominal laser wavelength.',
    discussionQuestions: [
      'What happens to the fringe pattern if one of the two slits is covered?',
      'Why do blue laser fringes appear closer together than red laser fringes under identical slit geometry?',
      'How does increasing the slit width a without changing separation d affect the visibility of higher-order fringes?',
    ],
    conclusions: 'The experiment proves wave interference and allows nanometer-scale wavelength metrology using macroscopic distance measurements.',
    challenges: [
      {
        id: 'doubleslit-challenge-1',
        title: 'Precision Metrology',
        description: 'Adjust the slit separation d and screen distance L to achieve an exact fringe spacing of Δy = 3.00 mm with a 632.8 nm laser.',
        targetMetric: 'fringeSpacingMm',
        targetValue: 3.00,
        tolerance: 0.05,
        initialParams: { wavelengthNm: 632.8, slitSeparationMm: 0.35, slitWidthMm: 0.04, screenDistanceM: 1.0 },
        solutionExplanation: 'Using Δy = λ L / d: with L = 1.422 m and d = 0.30 mm, (632.8e-6 * 1.422) / 0.30 = 3.00 mm.',
      },
    ],
  },

  // ROADMAP EXPERIMENTS (Visible as planned)
  'exp-polarization': {
    id: 'exp-polarization',
    stationId: 'polarization',
    status: 'roadmap',
    title: 'Polarization of Light, Malus’s Law, and Wave Plates',
    academicLevel: 'Undergraduate Physics II',
    learningObjectives: ['Measure Malus’s Law', 'Inspect Quarter & Half Wave Plates'],
    theory: 'Linear and circular polarization states under Jones matrix transformations.',
    instruments: ['Linear polarizers', 'Quarter-wave plate', 'Laser source', 'Power meter'],
    safety: ['Laser safety class 2'],
    setupDescription: 'Cascade of rotating polarizers on optical bench.',
    procedure: [],
    configurableVariables: [],
    measurementFields: [],
    mathematicalModel: ['I = I₀ · cos²(θ)'],
    expectedResults: 'Roadmap experiment planned for VOL 1.1.',
    analysisGuidelines: 'Planned feature.',
    discussionQuestions: [],
    conclusions: 'Planned for future commercial release.',
    challenges: [],
  },

  'exp-michelson': {
    id: 'exp-michelson',
    stationId: 'laser',
    status: 'roadmap',
    title: 'Interferometry: The Michelson Interferometer and Sub-Micron Metrology',
    academicLevel: 'Advanced Optical Engineering',
    learningObjectives: ['Measure optical path difference', 'Observe circular interference fringes'],
    theory: 'Amplitude division interferometry and fringe shift counting.',
    instruments: ['Beam splitter cube', 'Fixed mirror', 'Piezo-driven movable mirror', 'Laser source'],
    safety: ['Laser safety class 3R'],
    setupDescription: 'Michelson configuration with 50:50 beam splitter.',
    procedure: [],
    configurableVariables: [],
    measurementFields: [],
    mathematicalModel: ['Δ = 2 |d₁ - d₂|'],
    expectedResults: 'Roadmap experiment planned for VOL 1.1.',
    analysisGuidelines: 'Planned feature.',
    discussionQuestions: [],
    conclusions: 'Planned for future commercial release.',
    challenges: [],
  },

  'exp-fiber': {
    id: 'exp-fiber',
    stationId: 'photonics',
    status: 'roadmap',
    title: 'Photonics: Step-Index Fiber Waveguides and Numerical Aperture',
    academicLevel: 'Advanced Optical Engineering',
    learningObjectives: ['Measure fiber numerical aperture NA', 'Observe total internal reflection guidance'],
    theory: 'Waveguide condition in dielectric cylindrical cores.',
    instruments: ['Step-index silica fiber', 'Launch coupler', 'Laser source', 'Far-field detector'],
    safety: ['Fiber handling cleaver safety'],
    setupDescription: 'Fiber launch stage and far-field cone observation.',
    procedure: [],
    configurableVariables: [],
    measurementFields: [],
    mathematicalModel: ['NA = √(n_core² - n_clad²)'],
    expectedResults: 'Roadmap experiment planned for VOL 1.1.',
    analysisGuidelines: 'Planned feature.',
    discussionQuestions: [],
    conclusions: 'Planned for future commercial release.',
    challenges: [],
  },
};

export function getPractice(id: string): UniversityLabPractice {
  const p = LAB_PRACTICES[id];
  if (!p) throw new Error(`Lab practice "${id}" not found.`);
  return p;
}

export function listPractices(): UniversityLabPractice[] {
  return Object.values(LAB_PRACTICES);
}
