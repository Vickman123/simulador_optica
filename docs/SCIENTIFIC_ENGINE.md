# VOL Scientific Optics Engine — Technical & Physical Specification

**Author:** Vickora Labs Computational Optics Team  
**Module:** `@vickora/optics-engine`  
**License:** Proprietary / Commercial MVP 1.0  

---

## 1. Overview & Decoupling Principle

The VOL Scientific Optics Engine is an independent, pure computational library written in TypeScript with zero Three.js or DOM dependencies. It implements rigorous physical models across geometrical optics, paraxial lens systems, scalar wave interference, polarization calculus, and waveguide photonics.

All computations are performed in standard **SI units**:
- Length: meters ($m$)
- Wavelength: nanometers ($nm$) or micrometers ($\mu m$)
- Angles: radians ($rad$) internally, converted to degrees ($^\circ$) for user display
- Refractive index: dimensionless ($n \ge 1.0$)
- Optical power: normalized relative intensity ($0.0 \le I/I_0 \le 1.0$)

---

## 2. Mathematical Models & Implementation

### 2.1 Geometrical Optics & Fresnel Coefficients

#### Snell's Law in 3D Vector Form:
Given incident unit direction $\mathbf{s}$, unit surface normal $\mathbf{N}$ pointing toward the incident medium, and refractive indices $n_1, n_2$:
$$\cos\theta_1 = -(\mathbf{s} \cdot \mathbf{N})$$
$$\sin^2\theta_2 = \left(\frac{n_1}{n_2}\right)^2 (1 - \cos^2\theta_1)$$

- **Total Internal Reflection (TIR):** Occurs when $n_1 > n_2$ and $\sin^2\theta_2 > 1.0$.
  $$\theta_c = \arcsin\left(\frac{n_2}{n_1}\right)$$
- **Refracted Ray Vector:**
  $$\mathbf{r} = \left(\frac{n_1}{n_2}\right) \mathbf{s} + \left[\left(\frac{n_1}{n_2}\right)\cos\theta_1 - \cos\theta_2\right] \mathbf{N}$$
- **Specular Reflection Vector:**
  $$\mathbf{r}_{\text{refl}} = \mathbf{s} - 2(\mathbf{s}\cdot\mathbf{N})\mathbf{N}$$

#### Fresnel Boundary Conditions:
$$r_s = \frac{n_1 \cos\theta_1 - n_2 \cos\theta_2}{n_1 \cos\theta_1 + n_2 \cos\theta_2}, \quad r_p = \frac{n_2 \cos\theta_1 - n_1 \cos\theta_2}{n_2 \cos\theta_1 + n_1 \cos\theta_2}$$
$$R_s = |r_s|^2, \quad R_p = |r_p|^2, \quad R_{\text{unpol}} = \frac{R_s + R_p}{2}$$
$$T_s = 1 - R_s, \quad T_p = 1 - R_p, \quad T_{\text{unpol}} = 1 - R_{\text{unpol}}$$
**Energy Conservation:** In lossless media, $R + T = 1$ is strictly maintained across all angles $\theta \in [0, \pi/2]$.

#### Brewster's Angle:
$$\theta_B = \arctan\left(\frac{n_2}{n_1}\right)$$
At $\theta_i = \theta_B$, $R_p = 0$, producing perfectly s-polarized reflected light.

---

### 2.2 Lens Systems & Paraxial Optics

#### Gaussian Thin Lens Formula:
$$\frac{1}{f} = \frac{1}{d_o} + \frac{1}{d_i} \implies d_i = \frac{f \cdot d_o}{d_o - f}$$
- $d_o > f$: Real, inverted image ($d_i > 0, m < 0$)
- $d_o < f$: Virtual, erect, magnified image ($d_i < 0, m > 0$)
- $d_o = f$: Collimated beam ($d_i \to \infty$)
- Diverging lens ($f < 0$): Always virtual, erect, demagnified image.

#### Transverse Magnification:
$$m = -\frac{d_i}{d_o} = \frac{h_i}{h_o}$$

#### Lensmaker's Equation:
$$\frac{1}{f} = (n - 1) \left[ \frac{1}{R_1} - \frac{1}{R_2} + \frac{(n - 1)d}{n R_1 R_2} \right]$$

---

### 2.3 Wave Optics & Interference

#### Young's Double-Slit Intensity Distribution:
Combining two-slit interference with single-slit Fraunhofer diffraction envelope:
$$I(y) = I_0 \cos^2\left(\frac{\pi d \sin\theta}{\lambda}\right) \mathrm{sinc}^2\left(\frac{\pi a \sin\theta}{\lambda}\right)$$
Where $\sin\theta = \frac{y}{\sqrt{L^2 + y^2}}$, $\mathrm{sinc}(u) = \frac{\sin u}{u}$.

#### Fringe Spacing (Paraxial):
$$\Delta y = \frac{\lambda L}{d}, \quad \Delta\theta = \frac{\lambda}{d}$$

#### Missing Orders:
When an interference maximum coincides with a diffraction zero:
$$\frac{d}{a} = \frac{m}{p} \quad (p \in \mathbb{Z}^+)$$

---

### 2.4 Polarization & Jones Calculus

#### Malus's Law:
$$I(\theta) = I_0 \cos^2(\theta - \theta_0)$$
For a cascade of $N$ polarizers with transmission axis angles $\theta_1, \theta_2, \dots, \theta_N$:
$$I_N = I_0 \prod_{k=1}^N \cos^2(\theta_k - \theta_{k-1})$$

#### Three-Polarizer Paradox:
- Two crossed polarizers at $0^\circ$ and $90^\circ$: $I = 0$.
- Inserting a third polarizer at $45^\circ$ between them:
  $$I = I_0 \cos^2(45^\circ) \cos^2(45^\circ) = I_0 \left(\frac{1}{2}\right) \left(\frac{1}{2}\right) = 0.25 I_0$$
  Transmits 25% of incident light!

---

### 2.5 Sellmeier Dispersion & Material Database

The refractive index $n(\lambda)$ is computed using the 3-term Sellmeier formula with $\lambda$ in micrometers ($\mu m$):
$$n^2(\lambda) - 1 = \sum_{i=1}^3 \frac{B_i \lambda^2}{\lambda^2 - C_i}$$
Curated data from RefractiveIndex.INFO and SCHOTT AG (2023):
- **SCHOTT N-BK7®:** $B_1 = 1.03961212, C_1 = 0.00600069867, B_2 = 0.231792344, C_2 = 0.0200179144, B_3 = 1.01046945, C_3 = 103.560653$. Valid: $0.30 - 2.50\ \mu m$.
- **Fused Silica ($SiO_2$):** Malitson (1965) 3-term coefficients. Valid: $0.21 - 3.71\ \mu m$.
- **Dense Flint SF11®:** High dispersion, Abbe $V_d = 25.76$.
