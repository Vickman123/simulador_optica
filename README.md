# VOL — Virtual Optics Laboratory
### Commercial MVP 1.0 • Vickora Labs

> **Tagline:** Explore Light. Understand Physics. Experience Science.  
> **Target:** Modern Desktop Browsers & Meta Quest 3S (WebXR)

---

## 🔬 Overview

**VOL (Virtual Optics Laboratory)** is a commercial-grade university-level optical science simulation and immersive learning platform developed by **Vickora Labs**.

VOL provides a real, navigable 3D optical research laboratory housing six experimental stations, driven by an independent computational optics engine and integrated seamlessly with **VXR Core** for 6DoF WebXR manipulation in the **Meta Quest 3S**.

---

## 🏛️ Experimental Stations

| Station | Topic | Status | Physical Highlights |
| :--- | :--- | :--- | :--- |
| **Station A** | **Geometrical Optics** | **Active (MVP)** | Snell's Law, Critical Angle, Total Internal Reflection (TIR), Brewster's Angle, Fresnel Reflectance ($R_s, R_p, T$) |
| **Station B** | **Lens Systems** | **Active (MVP)** | Gaussian Thin Lens Equation ($1/f = 1/d_o + 1/d_i$), Lensmaker formula, real & virtual images, magnification ($m$) |
| **Station C** | **Wave Optics** | **Active (MVP)** | Thomas Young Double-Slit experiment, spatial fringe spacing ($\Delta y = \lambda L / d$), Fraunhofer diffraction envelope |
| **Station D** | **Polarization** | *Roadmap (v1.1)* | Malus's Law, 3-polarizer paradox, Jones calculus, wave plates |
| **Station E** | **Laser Experiments** | *Roadmap (v1.1)* | Michelson interferometer, sub-micron path difference, circular fringes |
| **Station F** | **Photonics & Fiber** | *Roadmap (v1.1)* | Step-index optical fiber, Numerical Aperture (NA), waveguide propagation |

---

## 📐 Scientific Engine (`@vickora/optics-engine`)

- **Pure TypeScript:** Zero Three.js or DOM dependencies.
- **SI Units:** Rigorous physical consistency ($m, rad, nm, W$).
- **Curated Glass Catalog:** Accurate Sellmeier 1 and Cauchy dispersion models for SCHOTT N-BK7®, SF11®, Fused Silica ($SiO_2$), $CaF_2$, Water, and Diamond based on RefractiveIndex.INFO (CC0).
- **Automated Vitest Suite:** 17 tests verifying Snell, Fresnel conservation ($R+T=1$), lens formulas, Sellmeier dispersion, and wave optics.

---

## 🥽 Meta Quest 3S & WebXR Integration

- **Zero Install:** Runs natively in **Meta Quest Browser** via WebXR Device API.
- **Performance Budget:** 72/90 Hz target frame rate with adaptive pixel ratio clamping ($1.0 - 1.25$) to prevent thermal throttling.
- **6DoF Interaction:** Ray-based grabbing, precision carrier sliding along optical rails, and teleport navigation.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 10

### Installation & Test Execution
```bash
# 1. Install dependencies
npm install

# 2. Run scientific validation test suite (Vitest)
npm test

# 3. Typecheck monorepo
npm run lint

# 4. Launch web application in development
npm run dev

# 5. Production build
npm run build
```

The web application will launch at `http://localhost:3000`.

---

## 📂 Repository Structure

```
simulador_optica/
├── apps/
│   └── vol-web/                   # React 19 + Vite + Tailwind CSS application
├── packages/
│   ├── optics-engine/             # Pure computational optics physics engine
│   ├── vol-data/                  # Curated optical material database (Sellmeier)
│   ├── vol-xr/                    # VOL adapter over VXR Core (6DoF benches)
│   ├── vol-learning/              # Guided university practices, challenges & rubrics
│   ├── shared/                    # Common types, SI unit formatters, telemetry
│   └── vxr-core/                  # Audited VXR Core runtime layer
├── docs/                          # Scientific & integration specifications
│   ├── SCIENTIFIC_ENGINE.md
│   ├── VXR_CORE_INTEGRATION.md
│   ├── COMMERCIAL_ROADMAP.md
│   └── assets/ASSET_REGISTER.md
└── public/data/asset-manifest.json
```

---

## 📜 License & Provenance

© 2026 Vickora Labs. All rights reserved.  
Material refractive index datasets sourced from RefractiveIndex.INFO under CC0 1.0 Universal license.
