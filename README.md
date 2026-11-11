# VOL — Laboratorio Virtual de Óptica (Virtual Optics Laboratory)
### MVP Comercial 1.0 • Vickora Labs

> **Lema:** *Explora la Luz. Comprende la Física. Experimenta la Ciencia.*  
> **Plataforma:** Aplicación Web 3D interactiva para Navegadores de Escritorio y Visores **Meta Quest 3S** (vía Meta Quest Browser con WebXR).  
> **Organización:** Vickora Labs — Sistemas de Ciencia y Aprendizaje Inmersivo Universitario.

---

## 🔬 1. Visión del Producto

**VOL (Virtual Optics Laboratory)** es una plataforma de software científico de nivel universitario diseñada para la enseñanza, simulación y experimentación interactiva de las ciencias ópticas y la fotónica.

A diferencia de simulaciones 2D estáticas o demostraciones aisladas de realidad virtual, VOL ofrece un **laboratorio universitario real, navegable y físicamente fundamentado**, accesible tanto desde computadoras convencionales y tablets, como de forma totalmente inmersiva en visores **Meta Quest 3S** mediante estándares abiertos de **WebXR**.

En VOL, los estudiantes e investigadores universitarios pueden:
- **Navegar espacialmente** por un laboratorio de investigación con 6 estaciones experimentales.
- **Manipular instrumental de laboratorio de precisión:** bancos ópticos, rieles milimétricos, lentes, prismas, diafragmas, divisores de haz, polarizadores y láseres sintonizables.
- **Ajustar parámetros físicos reales** (longitud de onda, ángulos de incidencia, focales, aperturas, espaciados de rendijas y materiales de vidrio).
- **Observar el comportamiento dinámico de la luz** mediante un motor de trazado de rayos y física ondulatoria en tiempo real.
- **Realizar mediciones cuantitativas** y contrastar resultados experimentales con modelos matemáticos y teóricos.
- **Completar prácticas de laboratorio estructuradas** (con guías paso a paso, laboratorios libres y retos científicos con validación de tolerancias).
- **Generar y exportar reportes oficiales de laboratorio** imprimibles en formato PDF y respaldados en archivos estructurados **CSV** y **JSON**.

---

## 🏛️ 2. Las Seis Estaciones Experimentales de Investigación

El laboratorio está compuesto por seis estaciones de trabajo especializadas dispuestas sobre mesas ópticas pesadas con aislamiento antivibratorio y superficies de aluminio anodizado negro con perforaciones roscadas M6:

| Estación | Rama Científica | Estado en MVP 1.0 | Modelos y Fenómenos Implementados |
| :--- | :--- | :--- | :--- |
| **Estación A** | **Óptica Geométrica** | **Activo y Validado** | Ley de Snell 3D, Reflexión y Refracción, Ángulo Crítico, Reflexión Total Interna (TIR), Ángulo de Brewster y Coeficientes de Fresnel ($R_s, R_p, R_{\text{unpol}}, T_s, T_p, T_{\text{unpol}}$). |
| **Estación B** | **Sistemas de Lentes** | **Activo y Validado** | Ecuación gaussiana de lentes delgadas ($1/f = 1/d_o + 1/d_i$), fórmula del fabricante de lentes (Lensmaker), magnificación transversal ($m$), imágenes reales e invertidas vs. imágenes virtuales y derechas, régimen de lupa y trazado de los 3 rayos principales. |
| **Estación C** | **Óptica Ondulatoria** | **Activo y Validado** | Experimento de la Doble Rendija de Thomas Young (1801), superposición escalar, espaciado de franjas ($\Delta y = \lambda L / d$), órdenes de difracción ausentes y modulación de envolvente de difracción de Fraunhofer. |
| **Estación D** | **Polarización** | *Hoja de Ruta (v1.1)* | Ley de Malus, cascadas de polarizadores lineales, demostración experimental de la paradoja de los tres polarizadores (transmisión del 25%), cálculo por vectores de Jones y láminas retardadoras ($\lambda/4$ y $\lambda/2$). |
| **Estación E** | **Láser e Interferometría** | *Hoja de Ruta (v1.1)* | Interferómetro de Michelson, diferencia de camino óptico (OPD), corrimiento y conteo sub-micrométrico de franjas circulares y pruebas de coherencia espacial y temporal. |
| **Estación F** | **Fotónica y Fibras Ópticas** | *Hoja de Ruta (v1.1)* | Guías de onda ópticas, fibras de índice escalonado, apertura numérica ($\mathrm{NA} = \sqrt{n_{\text{core}}^2 - n_{\text{clad}}^2}$), ángulo de aceptación y condición de operación monomodo ($V < 2.405$). |

---

## 📐 3. Motor Científico Computacional (`@vickora/optics-engine`)

El motor óptico de VOL fue diseñado bajo un principio estricto de **desacoplamiento total**: no depende de Three.js, WebGL ni del DOM. Realiza cálculos matemáticos analíticos en TypeScript puro operando de manera rigurosa en **unidades del Sistema Internacional (SI)** ($m$, $rad$, $nm$, $W$).

### Fundamentos Físicos Clave:

#### 1. Ley de Snell Vectorial y Coeficientes de Fresnel
Dado un vector unitario de incidencia $\mathbf{s}$, normal a la superficie $\mathbf{N}$ e índices de refracción $n_1$ y $n_2$:
$$\cos\theta_1 = -(\mathbf{s} \cdot \mathbf{N})$$
$$\sin^2\theta_2 = \left(\frac{n_1}{n_2}\right)^2 (1 - \cos^2\theta_1)$$
- **Reflexión Total Interna (TIR):** Ocurre cuando $n_1 > n_2$ y $\sin^2\theta_2 > 1.0$, con un ángulo crítico $\theta_c = \arcsin(n_2 / n_1)$.
- **Vector refractado:**
  $$\mathbf{r} = \left(\frac{n_1}{n_2}\right) \mathbf{s} + \left[\left(\frac{n_1}{n_2}\right)\cos\theta_1 - \cos\theta_2\right] \mathbf{N}$$
- **Conservación estricta de energía de Fresnel:**
  $$R_s = \left|\frac{n_1 \cos\theta_1 - n_2 \cos\theta_2}{n_1 \cos\theta_1 + n_2 \cos\theta_2}\right|^2, \quad R_p = \left|\frac{n_2 \cos\theta_1 - n_1 \cos\theta_2}{n_2 \cos\theta_1 + n_1 \cos\theta_2}\right|^2$$
  $$R + T = 1.0 \quad \text{en todos los medios no absorbentes sin pérdidas.}$$
- **Ángulo de Brewster:** $\theta_B = \arctan(n_2 / n_1)$, punto exacto donde la reflectancia del modo paralelo ($R_p$) se anula por completo.

#### 2. Ecuación Gaussiana de Lentes y Magnificación
$$\frac{1}{f} = \frac{1}{d_o} + \frac{1}{d_i} \implies d_i = \frac{f \cdot d_o}{d_o - f}$$
- $d_o > f$: Imagen real proyectable en pantalla física, invertida ($m < 0$).
- $d_o < f$: Imagen virtual derecha, no proyectable en pantalla, aumentada (régimen de lupa, $m > 1$).
- $d_o = f$: Haz colimado paralelo ($d_i \to \infty$).
- Lentes divergentes ($f < 0$): Siempre producen imágenes virtuales derechas y reducidas.
- Trazado tridimensional de los 3 rayos principales: Rayo paralelo (pasa por el foco $F'$), Rayo central (atraviesa el centro óptico sin desviarse) y Rayo focal (emerge paralelo al eje óptico).

#### 3. Interferencia de Doble Rendija y Difracción de Fraunhofer
Distribución analítica de intensidad en la pantalla de observación a una distancia $L$:
$$I(y) = I_0 \cos^2\left(\frac{\pi d \sin\theta}{\lambda}\right) \mathrm{sinc}^2\left(\frac{\pi a \sin\theta}{\lambda}\right)$$
Donde $\sin\theta = \frac{y}{\sqrt{L^2 + y^2}}$, $d$ es la separación entre rendijas y $a$ es el ancho individual de cada rendija.
- **Espaciado de franjas brillantes:** $\Delta y = \frac{\lambda L}{d}$.
- **Condición de mínimos de difracción:** $a \sin\theta = p \lambda$ ($p = 1, 2, \dots$).
- **Órdenes ausentes:** Órdenes de interferencia donde la envolvente de difracción anula el máximo ($d/a = m/p$).

---

## 💎 4. Catálogo de Vidrios y Materiales Ópticos (`@vickora/vol-data`)

La base de datos de VOL proviene de mediciones experimentales y ecuaciones validadas internacionalmente de **RefractiveIndex.INFO (CC0)** y del **Catálogo Óptico SCHOTT (2023)**.

Calcula el índice de refracción dependiente de la longitud de onda $n(\lambda)$ utilizando la ecuación de dispersión de **Sellmeier 1** ($\lambda$ en micrómetros):
$$n^2(\lambda) - 1 = \sum_{i=1}^3 \frac{B_i \lambda^2}{\lambda^2 - C_i}$$

### Materiales Incorporados y Verificados:
1. **SCHOTT N-BK7®:** Vidrio crown estándar más empleado en laboratorios de investigación óptica mundial ($n_d = 1.51680$, $V_d = 64.17$, rango: $0.30 - 2.50\ \mu m$).
2. **SCHOTT SF11®:** Vidrio flint denso de altísima dispersión cromática ($n_d = 1.78472$, $V_d = 25.76$, ideal para espectroscopía de arcoíris).
3. **Sílice Fundida ($SiO_2$):** Vidrio de cuarzo de alta pureza con transmisión desde el ultravioleta hasta el infrarrojo cercano (modelo de Malitson, 1965).
4. **Fluoruro de Calcio ($CaF_2$):** Cristal con mínima dispersión cromática (número de Abbe $V_d = 95.3$).
5. **Agua Destilada ($H_2O$, 20°C):** Ajuste de Daimon & Masumura (2007) ($n_d = 1.3330$).
6. **Diamante (C):** Alótropo de carbono con altísimo índice de refracción ($n_d \approx 2.417$).
7. **Polímeros Ópticos (PMMA y Policarbonato):** Dispersión de Cauchy ($n(\lambda) = A + B/\lambda^2 + C/\lambda^4$) para óptica plástica y lentes oftálmicas.
8. **Aire Estándar y Vacío:** Ecuación de Ciddor (1996) a 15°C y 101.325 kPa ($n \approx 1.000277$) y vacío unitario ($n = 1.0$).

---

## 🥽 5. Integración con VXR Core y WebXR en Meta Quest 3S

VOL utiliza **VXR Core (`@vxr/core` v0.1.0)** como su capa base de orquestación de renderizado y sesiones espaciales, acoplado mediante el adaptador seguro [`VolXrAdapter`](file:///Users/vickcarg/.gemini/antigravity/scratch/simulador_optica/packages/vol-xr/src/VolXrAdapter.ts).

### Optimizaciones Específicas para Meta Quest 3S:
- **Cero Instalaciones:** Funciona directamente abriendo **Meta Quest Browser** sobre el estándar nativo WebXR Device API.
- **Negociación Adaptativa de Framerate:** Solicita y asegura una tasa de refresco estable de **72 Hz o 90 Hz**, respetando el presupuesto estricto de **13.9 ms por fotograma**.
- **Control Térmico de GPU:** Limita el *pixel ratio* dinámico entre $1.0$ y $1.25$ para impedir el sobrecalentamiento térmico del chip Snapdragon XR2 Gen 2.
- **Interacción Espacial 6-DoF:** Trazado de rayos láser desde los mandos Touch Plus de Meta Quest, con agarre de componentes y encaje milimétrico sobre el riel óptico a lo largo del eje Z.
- **Persistencia de Estado:** El estado de las variables físicas y las mediciones tomadas se preserva de manera ininterrumpida al alternar entre el modo de pantalla y el modo inmersivo de VR.

---

## 🖥️ 6. Interfaz de Usuario y Experiencia de Aprendizaje

La aplicación web construida con **React 19, Vite y Tailwind CSS** ofrece:
- **Idioma Español Nativo y Selector (ES / EN):** Interfaz, terminología científica y reportes localizados al español, con selector de idioma en la barra superior.
- **Paneles Plegables y Desplegables:** El panel izquierdo (**Guía de Práctica**) y el panel derecho (**Espacio de Instrumentos**) cuentan con botones de repliegue instantáneo para evitar saturar la ventana en pantallas de laptops y tablets.
- **Botón de Vista 3D Completa (`⛶`):** Permite ocultar ambos paneles con un solo clic para dedicar el 100% de la ventana al entorno tridimensional.
- **Gráficas Científicas SVG en Tiempo Real:** Visualización en vivo de curvas de Fresnel $R_s(\theta)$ y $R_p(\theta)$ con indicación del ángulo de Brewster, hipérbolas conjugadas de lentes delgadas y perfil de intensidad de Young $I(y)$.
- **Tres Modos de Práctica:**
  - **Práctica Guiada:** Guía paso a paso con puntos de control verificables y fundamentos de seguridad láser.
  - **Laboratorio Libre:** Exploración irrestricta de todos los parámetros físicos y combinaciones de materiales.
  - **Reto Científico:** Problemas experimentales con cálculo automático de discrepancia y verificación de tolerancia numérica (ej. encontrar el nulo de Brewster o proyectar a $2\times$ exacto).
- **Cuaderno Experimental y Reporte Oficial:** Generador de reportes académicos imprimibles con estilo formal, porcentaje de error relativo experimental vs. teórico, notas del estudiante, bloques de firmas y exportación directa en formatos **CSV** y **JSON**.

---

## 🏢 7. Modelos de Licenciamiento Comercial

| Nivel de Licencia | Destinatarios | Alcance y Capacidades |
| :--- | :--- | :--- |
| **VOL Demo** | Estudiantes individuales y evaluadores | Acceso a las 3 estaciones experimentales activas del MVP, exportación local CSV/JSON y compatibilidad con escritorio y Quest 3S. |
| **VOL Academic** | Departamentos de Física e Ingeniería | Acceso a las 6 estaciones experimentales, prácticas guiadas, rúbricas de evaluación y generación de reportes oficiales de laboratorio. |
| **VOL Institutional** | Universidades y facultades completas | Integración con plataformas LMS (Canvas, Blackboard, Moodle vía LTI 1.3), panel de analítica para docentes y soporte técnico institucional con SLA. |
| **VOL XR Fleet** | Centros de Realidad Virtual y laboratorios especializados | Paquete de despliegue optimizado para flotas de visores Meta Quest 3S, mesas colaborativas multijugador y simulaciones de seguridad láser de alta potencia. |

---

## 🧪 8. Verificación y Suite de Pruebas Automatizadas

El proyecto cuenta con una batería de **17 pruebas unitarias y de validación científica** ejecutadas con **Vitest**:

```bash
✓ 1. Ley de Snell, Ángulo Crítico y Coeficientes de Fresnel
  ✓ Cálculo analítico de refracción de Snell en vidrio N-BK7
  ✓ Cálculo exacto del ángulo crítico de reflexión interna total (41.81°)
  ✓ Verificación del nulo de Brewster para el modo p-polarizado (Rp = 0 a 56.31°)
  ✓ Conservación rigurosa de energía R + T = 1 en todo el intervalo angular [0°, 85°]
✓ 2. Ecuaciones de Lentes Delgadas y Fabricante de Lentes
  ✓ Cálculo de posición de imagen real invertida y magnificación m = -0.667
  ✓ Formación de imagen virtual derecha y amplificada (régimen de lupa do < f)
  ✓ Comportamiento de lente divergente (f < 0) con imagen virtual y reducida
  ✓ Focal de lente biconvexa mediante ecuación del fabricante de lentes (Lensmaker)
✓ 3. Dispersión de Sellmeier y Base de Datos de Vidrios
  ✓ Reproducción de índices del catálogo SCHOTT N-BK7 en líneas de Fraunhofer (d, C, F)
  ✓ Verificación de dispersión normal dn/dλ < 0
  ✓ Reproducción de valores de Sílice Fundida (Malitson)
  ✓ Rechazo y lanzamiento de RangeError en longitudes de onda fuera de rango
✓ 4. Interferencia de Doble Rendija de Young
  ✓ Cálculo de espaciado de franjas Δy = (λ·L)/d y espaciado angular Δθ
  ✓ Detección de órdenes ausentes por cruce de ceros de difracción
✓ 5. Polarización y Ley de Malus
  ✓ Extinción total en polarizadores cruzados a 90° (intensidad cero)
  ✓ Paradoja del tercer polarizador: transmisión de 25% al insertar polarizador a 45°
✓ 6. Fotónica y Espectroscopía
  ✓ Apertura numérica (NA) de fibra óptica y condición de guía monomodo
  ✓ Ángulos de difracción de red de 600 líneas/mm a 532 nm y 632.8 nm
```

---

## 🚀 9. Guía de Ejecución y Desarrollo Local

### Requisitos Previos:
- **Node.js:** Versión `>= 20.0.0` (recomendado v22 o v24).
- **npm:** Versión `>= 10.0.0`.

### Pasos de Instalación y Lanzamiento:

```bash
# 1. Clonar el repositorio
git clone git@github.com:Vickman123/simulador_optica.git
cd simulador_optica

# 2. Instalar las dependencias de los paquetes del monorepositorio
npm install

# 3. Ejecutar la suite de pruebas científicas (Vitest)
npm test

# 4. Verificar consistencia de tipos TypeScript en todo el proyecto
npm run lint

# 5. Iniciar el servidor web de desarrollo
npm run dev

# 6. Compilar para distribución en producción
npm run build
```

Una vez iniciado el servidor:
- **En tu computadora:** Abre `http://localhost:3001/` en tu navegador favorito.
- **En tu visor Meta Quest 3S:** Conecta el visor a la misma red Wi-Fi, abre el **Meta Quest Browser**, accede a la IP local (ej. `http://10.200.2.40:3001/`) y pulsa **Entrar a VR (Quest 3S)**.

---

## 🌐 10. Despliegue Público en GitHub Pages

VOL cuenta con un flujo automatizado de Integración Continua (CI/CD) mediante **GitHub Actions** (`.github/workflows/deploy.yml`).

### Enlace de Acceso Público:
👉 **[https://vickman123.github.io/simulador_optica/](https://vickman123.github.io/simulador_optica/)**

### ¿Cómo activar GitHub Pages en tu repositorio?
1. Ingresa a tu repositorio en GitHub: [https://github.com/Vickman123/simulador_optica](https://github.com/Vickman123/simulador_optica)
2. Haz clic en la pestaña **Settings** (Configuración) en la barra superior.
3. En la barra lateral izquierda, selecciona **Pages** (dentro de la sección *Code and automation*).
4. En **Build and deployment** > **Source**, despliega el selector y elige **GitHub Actions**.
5. ¡Listo! El flujo se ejecutará de forma automática en cada cambio que subas a la rama `main` y mantendrá tu simulador siempre actualizado y visible en la web para cualquier persona o visor VR.

---

## 📁 11. Estructura del Repositorio

```
simulador_optica/
├── apps/
│   └── vol-web/                   # Aplicación web en React 19 + Vite + Tailwind CSS
│       ├── src/
│       │   ├── components/        # Componentes UI (Landing, Laboratorio, Gráficas, Modales)
│       │   ├── services/          # Persistencia local (localStorage, JSON, CSV)
│       │   ├── i18n.ts            # Diccionarios de internacionalización (Español / Inglés)
│       │   ├── App.tsx            # Enrutador principal de vistas
│       │   └── main.tsx           # Punto de montaje del cliente
├── packages/
│   ├── optics-engine/             # Motor computacional de física óptica pura (SI, sin Three.js)
│   ├── vol-data/                  # Base de datos de vidrios ópticos (Sellmeier / RefractiveIndex.INFO)
│   ├── vol-xr/                    # Adaptador espacial sobre VXR Core y generación de instrumentos 3D
│   ├── vol-learning/              # Prácticas universitarias, retos numéricos y rúbricas
│   ├── shared/                    # Tipos compartidos, esquemas de telemetría y conversión RGB de fotones
│   └── vxr-core/                  # Núcleo VXR Core (orquestación WebGL, WebXR y cámaras)
├── docs/                          # Especificaciones científicas y técnicas
│   ├── SCIENTIFIC_ENGINE.md       # Documentación física profunda y deducciones analíticas
│   ├── VXR_CORE_INTEGRATION.md    # Arquitectura WebXR y perfiles de rendimiento Meta Quest 3S
│   ├── COMMERCIAL_ROADMAP.md      # Modelo comercial, integración LTI 1.3 y fases v1.1 / v1.2
│   └── assets/ASSET_REGISTER.md   # Registro de procedencia y licencias de activos 3D (CC0)
├── public/data/asset-manifest.json# Manifiesto de activos en JSON
└── package.json                   # Manifiesto raíz del monorepositorio con npm workspaces
```

---

## 📜 11. Registro de Propiedad y Licencias

© 2026 **Vickora Labs**. Todos los derechos reservados.  
Los datos de constantes ópticas proceden de **RefractiveIndex.INFO** bajo licencia pública **CC0 1.0 Universal** y del catálogo técnico abierto de **SCHOTT AG**.
