import { UniversityLabPractice } from './types.js';

export const LAB_PRACTICES: Record<string, UniversityLabPractice> = {
  // PRÁCTICA 1: Reflexión, Refracción y Ley de Snell
  'exp-snell': {
    id: 'exp-snell',
    stationId: 'geometric',
    status: 'active',
    title: 'Comportamiento de la Luz: Reflexión, Refracción y Ley de Snell',
    academicLevel: 'Física General y Óptica',
    learningObjectives: [
      'Descubrir cómo la luz cambia de dirección (se refracta) al pasar del aire al vidrio.',
      'Comprobar la Ley de Snell ajustando el ángulo de inclinación del láser.',
      'Observar la Reflexión Total Interna: el fenómeno por el cual la luz no puede salir del vidrio y rebota como un espejo perfecto (así funciona el internet por fibra óptica).',
      'Localizar el Ángulo de Brewster: la inclinación mágica donde el reflejo desaparece por completo.',
    ],
    theory: `Cuando un haz de luz viaja por el aire y choca contra un bloque de vidrio transparente, ocurren dos cosas al mismo tiempo:
    
    1. Una parte de la luz rebota hacia atrás (Reflexión).
    2. Otra parte entra al vidrio, pero al entrar a un medio más denso disminuye su velocidad y cambia de dirección (Refracción).
    
    Este cambio de dirección sigue la Ley de Snell:
    n₁ · sen(θ₁) = n₂ · sen(θ₂)
    
    Donde n₁ es el aire (1.0) y n₂ es el índice del vidrio (alrededor de 1.5). Si inclinas la luz desde adentro del vidrio, llegará un punto donde ya no puede salir al aire y rebotará al 100%: esto se llama Reflexión Total Interna.`,
    instruments: [
      'Mesa de investigación óptica con raíl de montaje',
      'Emisor láser ajustable con selección de colores (Rojo 633 nm, Verde 532 nm, Azul 488 nm)',
      'Transportador circular graduado de alta precisión en grados (°)',
      'Bloque óptico semicilíndrico de vidrio SCHOTT N-BK7® y Sílice Fundida',
      'Detector de potencia lumínica y porcentaje de rebote',
    ],
    safety: [
      'Láser activo: No mires directamente hacia la salida del haz.',
      'Usa gafas protectoras acordes a la longitud de onda seleccionada.',
      'Mantén los rayos dirigidos siempre hacia la mesa o los absorbedores.',
    ],
    setupDescription: 'El bloque de vidrio semicilíndrico está montado en el centro del transportador. El rayo láser apunta al centro plano de la pieza para que puedas medir con exactitud los grados de entrada y salida.',
    procedure: [
      {
        stepNumber: 1,
        title: 'Encendido y Láser Recto a 0°',
        instruction: 'Selecciona el láser rojo (632.8 nm). Ajusta el ángulo a 0° para que el rayo entre perpendicular y observes que la luz pasa recta sin desviarse.',
        actionLabel: '🔴 Probar Paso 1: Láser Rojo a 0°',
        presetParams: { incidentAngleDeg: 0, wavelengthNm: 632.8, materialId: 'nbk7' },
        feedbackText: '¡Láser Rojo encendido a 0°! Como entra perpendicular, la luz viaja en línea recta sin desviarse.',
      },
      {
        stepNumber: 2,
        title: 'Observación de la Desviación (Ley de Snell)',
        instruction: 'Mueve el control deslizante a 30°. Observa en la mesa 3D cómo el rayo que entra al vidrio se desvía a unos 19.3° y aparece un rayo reflejado débil.',
        actionLabel: '📐 Probar Paso 2: Inclinar Láser a 30°',
        presetParams: { incidentAngleDeg: 30, wavelengthNm: 632.8, materialId: 'nbk7' },
        feedbackText: '¡Ángulo a 30° aplicado! La luz entra al vidrio desviada a 19.3° (Ley de Snell) y una pequeña parte rebota hacia atrás.',
      },
      {
        stepNumber: 3,
        title: 'El Ángulo de Brewster (Reflejo Cero)',
        instruction: 'Ajusta el ángulo a 56.7°. En la gráfica de la derecha notarás que la curva dorada de polarización cae a cero: ¡el reflejo casi desaparece!',
        actionLabel: '✨ Probar Paso 3: Ángulo de Brewster (56.7°)',
        presetParams: { incidentAngleDeg: 56.7, wavelengthNm: 632.8, materialId: 'nbk7' },
        feedbackText: '¡Ángulo de Brewster alcanzado (56.7°)! Observa cómo el reflejo en la mesa casi desaparece por completo.',
      },
      {
        stepNumber: 4,
        title: 'Prueba con Vidrio Denso (SF11)',
        instruction: 'Cambia el material a SF11 (vidrio denso). Fíjate cómo entre mayor es el índice del material, más se dobla el rayo de luz.',
        actionLabel: '💎 Probar Paso 4: Colocar Vidrio Denso SF11',
        presetParams: { incidentAngleDeg: 45, wavelengthNm: 632.8, materialId: 'sf11' },
        feedbackText: '¡Vidrio SF11 de alto índice colocado! Al ser más denso, desvía la luz con aún mayor fuerza.',
      },
    ],
    configurableVariables: [
      {
        name: 'Ángulo de Incidencia',
        key: 'incidentAngleDeg',
        unit: 'grados (°)',
        min: 0,
        max: 85,
        step: 0.5,
        defaultValue: 30,
      },
      {
        name: 'Color / Longitud de Onda',
        key: 'wavelengthNm',
        unit: 'nm',
        min: 405,
        max: 670,
        step: 1,
        defaultValue: 632.8,
      },
      {
        name: 'Material del Vidrio',
        key: 'materialId',
        unit: 'material',
        min: 0,
        max: 0,
        step: 1,
        defaultValue: 'nbk7',
      },
    ],
    measurementFields: [
      { name: 'Ángulo de Incidencia', symbol: 'θ_i', unit: '°' },
      { name: 'Ángulo Refractado en Vidrio', symbol: 'θ_t', unit: '°' },
      { name: 'Porcentaje de Luz Reflejada', symbol: 'R', unit: '%' },
      { name: 'Porcentaje de Luz Transmitida', symbol: 'T', unit: '%' },
      { name: 'Índice de Refracción Calculado', symbol: 'n_exp', unit: '' },
    ],
    mathematicalModel: [
      'Ley de Snell: n₁ · sen(θ_i) = n₂ · sen(θ_t)',
      'Ángulo Crítico (Rebote 100%): θ_c = arcsin(n₂ / n₁)',
      'Ángulo de Brewster (Sin reflejo): θ_B = arctan(n₂ / n₁)',
      'Conservación de Energía: Luz Reflejada (R) + Luz Transmitida (T) = 100%',
    ],
    expectedResults: 'Para el vidrio estándar N-BK7 a 632.8 nm (n ≈ 1.515), con una inclinación de 30°, la luz entra al vidrio a 19.3°. El ángulo de Brewster ocurre exactamente a los 56.6°.',
    analysisGuidelines: 'Al graficar sen(θ_i) frente a sen(θ_t), obtendrás una línea recta cuya pendiente es exactamente el índice de refracción del vidrio.',
    discussionQuestions: [
      '¿Por qué una pajilla o popote en un vaso con agua parece quebrarse en la superficie?',
      '¿Por qué el cielo azul se refleja como espejo en una alberca cuando lo miras muy inclinado?',
      '¿Cómo viajan los datos en los cables submarinos de internet gracias a la reflexión total interna?',
    ],
    conclusions: 'La luz siempre reduce su ángulo hacia la normal al ingresar a un medio más denso, conservando la energía total entre la luz que rebota y la que entra.',
    challenges: [
      {
        id: 'snell-challenge-1',
        title: 'El Secreto de Brewster',
        description: 'Ajusta el ángulo del láser hasta encontrar el ángulo exacto donde el reflejo paralelo (línea dorada) se anula por completo (aproximadamente a 56.6°).',
        targetMetric: 'reflectedIntensity',
        targetValue: 0.0,
        tolerance: 0.005,
        initialParams: { incidentAngleDeg: 25, wavelengthNm: 632.8, materialId: 'nbk7' },
        solutionExplanation: '¡Excelente trabajo! Encontraste el ángulo de Brewster (56.6°). En este punto exacto, las gafas de sol polarizadas eliminan todos los reflejos molestos del agua o el pavimento.',
      },
    ],
  },

  // PRÁCTICA 2: Sistemas de Lentes e Imágenes
  'exp-lenses': {
    id: 'exp-lenses',
    stationId: 'lenses',
    status: 'active',
    title: 'Sistemas de Lentes: Cómo se Forman las Imágenes, Focos y Aumento',
    academicLevel: 'Física y Óptica Geométrica',
    learningObjectives: [
      'Aprender cómo una lente curva concentra la luz en un punto focal.',
      'Comprender la diferencia entre una Imagen Real (que se puede proyectar en una pantalla o pared) y una Imagen Virtual (como la que ves a través de una lupa o en un espejo).',
      'Calcular el aumento o reducción de una imagen según la distancia del objeto.',
      'Experimentar con lentes convergentes (abultadas) y divergentes (huecas).',
    ],
    theory: `Una lente es un disco de vidrio curvo que dobla los rayos de luz para enfocarlos o dispersarlos.
    
    El comportamiento de una lente delgada se resume en la famosa ecuación de Gauss:
    1/f = 1/d_o + 1/d_i
    
    Donde:
    - f es la distancia focal (distancia desde la lente hasta el punto donde se concentra la luz).
    - d_o es la distancia desde el objeto hasta la lente.
    - d_i es la distancia desde la lente hasta donde se forma la imagen.
    
    El aumento (magnificación) m = -d_i / d_o te dice cuántas veces más grande o más pequeña se verá la imagen, y si sale al revés (invertida) o al derecho.`,
    instruments: [
      'Riel óptico milimétrico graduado de 1.5 metros',
      'Objeto iluminado con patrón en cruz o letra F',
      'Montura con lente convergente biconvexa (foco = +100 mm)',
      'Montura con lente divergente cóncava (foco = -150 mm)',
      'Pantalla blanca móvil de proyección y enfoque',
    ],
    safety: [
      'Maneja las lentes de cristal sujetándolas por el anillo metálico para no mancharlas de grasa.',
      'No tapes las ranuras de ventilación del foco emisor.',
    ],
    setupDescription: 'El objeto iluminado se ubica a la izquierda del riel. La lente se monta en el centro y la pantalla de proyección se desplaza a la derecha hasta que la imagen proyectada se vea completamente nítida.',
    procedure: [
      {
        stepNumber: 1,
        title: 'Imagen Real e Invertida (Como en el Ojo o la Cámara)',
        instruction: 'Coloca el objeto a 250 mm de la lente (foco = 100 mm). Desplaza la pantalla hasta que la imagen quede enfocada (a unos 167 mm). Observa que la imagen aparece de cabeza (invertida).',
        actionLabel: '📸 Probar Paso 1: Objeto Lejano (s = 25 cm)',
        presetParams: { focalLengthMm: 100, objectDistanceMm: 250, objectHeightMm: 20 },
        feedbackText: '¡Objeto a 25 cm colocado! La imagen proyectada se forma a 16.7 cm y aparece invertida.',
      },
      {
        stepNumber: 2,
        title: 'Tamaño Idéntico (Punto Simétrico 2f)',
        instruction: 'Pon el objeto a exactamente 200 mm (el doble del foco: 2f). Verás que la imagen se forma también a 200 mm y tiene exactamente el mismo tamaño que el original (aumento = -1).',
        actionLabel: '⚖️ Probar Paso 2: Punto Simétrico 2f (20 cm)',
        presetParams: { focalLengthMm: 100, objectDistanceMm: 200, objectHeightMm: 20 },
        feedbackText: '¡Punto 2f activo! La imagen tiene exactamente la misma altura que el objeto original.',
      },
      {
        stepNumber: 3,
        title: 'Efecto Lupa (Imagen Virtual)',
        instruction: 'Acerca el objeto a menos de 100 mm de la lente (por ejemplo a 60 mm). Verás que en la pantalla no se forma imagen: para verla debes mirar a través de la lente como en una lupa.',
        actionLabel: '🔍 Probar Paso 3: Modo Lupa (s = 6 cm)',
        presetParams: { focalLengthMm: 100, objectDistanceMm: 60, objectHeightMm: 20 },
        feedbackText: '¡Modo Lupa activado! Al estar dentro del foco, la imagen se amplifica y se ve derecha al mirar a través de la lente.',
      },
      {
        stepNumber: 4,
        title: 'Lente Divergente (Cóncava)',
        instruction: 'Cambia la distancia focal a un valor negativo (-100 mm). Los rayos se abren en lugar de juntarse, produciendo una imagen siempre derecha y más pequeña.',
        actionLabel: '👓 Probar Paso 4: Lente Cóncava (-100 mm)',
        presetParams: { focalLengthMm: -100, objectDistanceMm: 250, objectHeightMm: 20 },
        feedbackText: '¡Lente cóncava colocada! Los rayos se abren hacia afuera, dispersando la luz.',
      },
    ],
    configurableVariables: [
      {
        name: 'Distancia Focal (f)',
        key: 'focalLengthMm',
        unit: 'mm',
        min: -150,
        max: 250,
        step: 10,
        defaultValue: 100,
      },
      {
        name: 'Distancia del Objeto (d_o)',
        key: 'objectDistanceMm',
        unit: 'mm',
        min: 30,
        max: 500,
        step: 5,
        defaultValue: 250,
      },
      {
        name: 'Altura del Objeto (h_o)',
        key: 'objectHeightMm',
        unit: 'mm',
        min: 5,
        max: 40,
        step: 1,
        defaultValue: 20,
      },
    ],
    measurementFields: [
      { name: 'Distancia del Objeto', symbol: 'd_o', unit: 'mm' },
      { name: 'Distancia de la Imagen', symbol: 'd_i', unit: 'mm' },
      { name: 'Altura de la Imagen', symbol: 'h_i', unit: 'mm' },
      { name: 'Aumento (Magnificación)', symbol: 'm', unit: 'veces' },
    ],
    mathematicalModel: [
      'Ecuación de Gauss: 1/f = 1/d_o + 1/d_i',
      'Distancia a la Imagen: d_i = (f · d_o) / (d_o - f)',
      'Aumento Transversal: m = -d_i / d_o = h_i / h_o',
      'Si d_i > 0: Imagen Real (proyectable) • Si d_i < 0: Imagen Virtual (lupa)',
    ],
    expectedResults: 'Con f = 100 mm y d_o = 250 mm: d_i = 166.7 mm y aumento m = -0.67 (imagen real invertida, reducida al 67% del tamaño original).',
    analysisGuidelines: 'Al acercar el objeto hacia el foco f, la imagen se aleja rápidamente hacia el infinito y se hace gigantesca.',
    discussionQuestions: [
      '¿Por qué las cámaras fotográficas y nuestros ojos capturan imágenes que en la retina están al revés?',
      '¿Qué ocurre con la imagen cuando colocas el objeto exactamente en el foco f de la lente?',
      '¿Cómo combinan los telescopios dos lentes para acercar las estrellas lejanas?',
    ],
    conclusions: 'La posición y el tamaño de la imagen dependen de si el objeto está más lejos o más cerca que la distancia focal de la lente.',
    challenges: [
      {
        id: 'lens-challenge-1',
        title: 'El Proyector de Cine 2X',
        description: 'Ajusta la distancia del objeto d_o con la lente de 100 mm para conseguir una imagen proyectada real que sea exactamente el doble de grande que el objeto (aumento m = -2.0).',
        targetMetric: 'magnification',
        targetValue: -2.0,
        tolerance: 0.08,
        initialParams: { focalLengthMm: 100, objectDistanceMm: 300, objectHeightMm: 20 },
        solutionExplanation: '¡Misión cumplida! Para duplicar el tamaño en una imagen real, colocaste el objeto a 150 mm (1.5 veces el foco), proyectando la imagen a 300 mm.',
      },
    ],
  },

  // PRÁCTICA 3: Experimento de la Doble Rendija de Young
  'exp-doubleslit': {
    id: 'exp-doubleslit',
    stationId: 'wave',
    status: 'active',
    title: 'Naturaleza Ondulatoria de la Luz: Experimento de Doble Rendija de Thomas Young',
    academicLevel: 'Física Ondulatoria y Cuántica',
    learningObjectives: [
      'Demostrar que la luz se comporta como una ola u onda en el agua.',
      'Observar cómo dos haces de luz pueden sumarse para dar más luz o cancelarse para crear oscuridad (interferencia).',
      'Medir la distancia entre las franjas luminosas en la pantalla.',
      'Calcular el tamaño nanoscópico de las ondas de luz a partir de mediciones hechas con una simple regla.',
    ],
    theory: `En 1801, Thomas Young realizó uno de los experimentos más famosos y hermosos de la historia de la ciencia.
    
    Hizo pasar luz a través de dos rendijas diminutas muy cercanas entre sí. Si la luz fueran simples pelotitas, en la pared se verían únicamente dos rayas de luz.
    
    Sin embargo, lo que aparece es una serie de rayas brillantes y oscuras alternadas (un patrón de interferencia).
    - Donde las crestas de las dos ondas se juntan: la luz se refuerza (franja brillante).
    - Donde la cresta de una onda coincide con el valle de la otra: se destruyen mutuamente (oscuridad).
    
    La separación entre cada raya brillante en la pantalla está dada por:
    Δy = (λ · L) / d
    
    Donde λ es la longitud de onda de la luz, L es la distancia a la pantalla y d es la separación entre las dos rendijas.`,
    instruments: [
      'Riel óptico estable de laboratorio',
      'Láser de diodo verde de alta pureza (532 nm)',
      'Placa con doble rendija micrograbada de precisión',
      'Pantalla de observación blanca con regla milimétrica',
    ],
    safety: [
      'Láser verde: el ojo humano es sumamente sensible a este color. Evita reflejos en superficies metálicas brillantes.',
      'Mantén siempre la altura del haz por debajo del nivel de los ojos.',
    ],
    setupDescription: 'El láser emite un haz que cruza las dos ranuras paralelas. Las dos ondas cilíndricas que emergen viajan hasta la pantalla de proyección, donde forman el patrón de bandas luminosas.',
    procedure: [
      {
        stepNumber: 1,
        title: 'Observación del Patrón de Bandas',
        instruction: 'Con el láser verde (532 nm) encendido, observa en la pantalla la hilera de franjas de luz separadas por zonas oscuras.',
        actionLabel: '🟢 Probar Paso 1: Láser Verde (532 nm)',
        presetParams: { wavelengthNm: 532, slitSeparationMm: 0.25, slitWidthMm: 0.04, screenDistanceM: 1.2 },
        feedbackText: '¡Láser verde activo! Mira las franjas luminosas alternadas en la pantalla.',
      },
      {
        stepNumber: 2,
        title: 'Efecto de la Separación de Rendijas',
        instruction: 'Mueve el control de separación d a un valor más pequeño (0.15 mm). Verás que al juntar las rendijas, las franjas en la pantalla se separan mucho más.',
        actionLabel: '↔️ Probar Paso 2: Juntar Rendijas (0.15 mm)',
        presetParams: { slitSeparationMm: 0.15 },
        feedbackText: '¡Rendijas más juntas! Al acercarlas, el patrón en la pantalla se abre mucho más.',
      },
      {
        stepNumber: 3,
        title: 'Cambio de Color / Longitud de Onda',
        instruction: 'Cambia a luz roja (633 nm). Fíjate que la luz roja (ondas más largas) genera franjas más anchas que la verde.',
        actionLabel: '🔴 Probar Paso 3: Cambiar a Láser Rojo (633 nm)',
        presetParams: { wavelengthNm: 632.8 },
        feedbackText: '¡Láser rojo activo! Al tener mayor longitud de onda, las franjas rojas son más anchas que las verdes.',
      },
      {
        stepNumber: 4,
        title: 'Distancia a la Pantalla',
        instruction: 'Aleja la pantalla a 1.8 metros. A mayor distancia de viaje, las ondas se abren más y el patrón se amplifica.',
        actionLabel: '📺 Probar Paso 4: Alejar Pantalla (1.8 m)',
        presetParams: { screenDistanceM: 1.8 },
        feedbackText: '¡Pantalla alejada! A mayor distancia de proyección, el patrón de interferencia se amplifica.',
      },
    ],
    configurableVariables: [
      {
        name: 'Color / Longitud de Onda (λ)',
        key: 'wavelengthNm',
        unit: 'nm',
        min: 400,
        max: 700,
        step: 5,
        defaultValue: 532,
      },
      {
        name: 'Separación entre Rendijas (d)',
        key: 'slitSeparationMm',
        unit: 'mm',
        min: 0.1,
        max: 0.8,
        step: 0.02,
        defaultValue: 0.25,
      },
      {
        name: 'Distancia a Pantalla (L)',
        key: 'screenDistanceM',
        unit: 'm',
        min: 0.5,
        max: 2.5,
        step: 0.1,
        defaultValue: 1.2,
      },
    ],
    measurementFields: [
      { name: 'Espaciado entre Franjas', symbol: 'Δy', unit: 'mm' },
      { name: 'Espaciado Angular', symbol: 'Δθ', unit: 'mrad' },
      { name: 'Longitud de Onda Comprobada', symbol: 'λ_calc', unit: 'nm' },
    ],
    mathematicalModel: [
      'Interferencia Constructiva: d · sen(θ) = m · λ (m = 0, ±1, ±2...)',
      'Espaciado entre Franjas: Δy = (λ · L) / d',
      'Perfil de Intensidad: I(y) = I₀ · cos²(π d sen θ / λ) · sinc²(π a sen θ / λ)',
    ],
    expectedResults: 'Para luz verde de 532 nm con rendijas separadas 0.25 mm y pantalla a 1.2 m, la distancia entre cada franja brillante es de 2.55 mm.',
    analysisGuidelines: 'Al medir el espaciado Δy con una simple regla milimétrica, puedes despejar λ = (d · Δy) / L y medir el tamaño de una onda luminosa con precisión de millonésimas de milímetro.',
    discussionQuestions: [
      '¿Por qué si tapas una de las dos rendijas desaparece todo el patrón de rayas y queda solo una mancha difusa?',
      '¿Por qué las ondas de sonido pueden doblar las esquinas de una puerta abierta pero la luz casi no?',
      '¿Cómo dio este experimento origen a la física cuántica al repetirse disparando fotón por fotón?',
    ],
    conclusions: 'La luz es indiscutiblemente una onda capaz de interferir consigo misma, creando luz de la suma de ondas o completa oscuridad de su cancelación.',
    challenges: [
      {
        id: 'doubleslit-challenge-1',
        title: 'Calibración de Precisión a 3.00 mm',
        description: 'Ajusta la separación d y la distancia a la pantalla L usando un láser rojo de 632.8 nm hasta conseguir un espaciado exacto de franjas de Δy = 3.00 mm.',
        targetMetric: 'fringeSpacingMm',
        targetValue: 3.00,
        tolerance: 0.06,
        initialParams: { wavelengthNm: 632.8, slitSeparationMm: 0.35, slitWidthMm: 0.04, screenDistanceM: 1.0 },
        solutionExplanation: '¡Genial! Calibraste el banco óptico para obtener franjas de exactamente 3.00 mm. Con L = 1.42 m y d = 0.30 mm se obtiene la relación deseada.',
      },
    ],
  },

  // ESTACIONES EN HOJA DE RUTA
  'exp-polarization': {
    id: 'exp-polarization',
    stationId: 'polarization',
    status: 'roadmap',
    title: 'Polarización de la Luz, Ley de Malus y Filtros Ópticos',
    academicLevel: 'Física Ondulatoria',
    learningObjectives: ['Comprender la oscilación del campo electromagnético', 'Verificar la Ley de Malus'],
    theory: 'La luz oscila en planos perpendiculares a su propagación. Los polarizadores seleccionan una única dirección de vibración.',
    instruments: ['Polarizadores lineales giratorios', 'Láser', 'Fotodetector'],
    safety: ['Seguridad láser clase 2'],
    setupDescription: 'Filtros polarizadores colocados en cascada a lo largo del riel.',
    procedure: [],
    configurableVariables: [],
    measurementFields: [],
    mathematicalModel: ['I = I₀ · cos²(θ)'],
    expectedResults: 'Estación planificada para la actualización v1.1.',
    analysisGuidelines: 'Próximamente disponible.',
    discussionQuestions: [],
    conclusions: 'Próximamente disponible.',
    challenges: [],
  },

  'exp-michelson': {
    id: 'exp-michelson',
    stationId: 'laser',
    status: 'roadmap',
    title: 'Interferometría Láser: El Interferómetro de Michelson',
    academicLevel: 'Ingeniería Óptica Avanzada',
    learningObjectives: ['Medir diferencias de camino óptico', 'Contar franjas circulares de interferencia'],
    theory: 'División de amplitud mediante espejo semirreflectante y recombinación coherente.',
    instruments: ['Divisor de haz 50:50', 'Espejo fijo', 'Espejo micrométrico piezoeléctrico', 'Láser He-Ne'],
    safety: ['Láser clase 3R'],
    setupDescription: 'Montaje en cruz sobre mesa antivibratoria.',
    procedure: [],
    configurableVariables: [],
    measurementFields: [],
    mathematicalModel: ['Δ = 2 |d₁ - d₂|'],
    expectedResults: 'Estación planificada para la actualización v1.1.',
    analysisGuidelines: 'Próximamente disponible.',
    discussionQuestions: [],
    conclusions: 'Próximamente disponible.',
    challenges: [],
  },

  'exp-fiber': {
    id: 'exp-fiber',
    stationId: 'photonics',
    status: 'roadmap',
    title: 'Fotónica: Fibras Ópticas y Apertura Numérica',
    academicLevel: 'Ingeniería de Telecomunicaciones',
    learningObjectives: ['Medir la apertura numérica de una fibra', 'Guiado de luz por reflexión interna total'],
    theory: 'Propagación de luz confinada en un núcleo de vidrio recubierto de menor índice.',
    instruments: ['Carrete de fibra óptica', 'Inyector de luz', 'Láser infrarrojo/visible', 'Medidor de potencia'],
    safety: ['Cuidado con fragmentos de fibra cortada'],
    setupDescription: 'Sistema de inyección y pantalla de proyección del cono de salida.',
    procedure: [],
    configurableVariables: [],
    measurementFields: [],
    mathematicalModel: ['NA = √(n_núcleo² - n_revestimiento²)'],
    expectedResults: 'Estación planificada para la actualización v1.1.',
    analysisGuidelines: 'Próximamente disponible.',
    discussionQuestions: [],
    conclusions: 'Próximamente disponible.',
    challenges: [],
  },
};

export function getPractice(id: string): UniversityLabPractice {
  const p = LAB_PRACTICES[id];
  if (!p) throw new Error(`Práctica "${id}" no encontrada.`);
  return p;
}

export function listPractices(): UniversityLabPractice[] {
  return Object.values(LAB_PRACTICES);
}
