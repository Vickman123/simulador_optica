# VOL — VXR Core Integration & WebXR Architecture

**Author:** Vickora Labs Immersive Computing Group  
**Framework:** VXR Core (`@vxr/core` v0.1.0)  
**Target Headset:** Meta Quest 3S (Meta Quest Browser / WebXR Device API)  

---

## 1. Architectural Role of VXR Core

VXR Core serves as the foundational spatial simulation runtime for VOL.
Rather than rewriting rendering loops, camera controllers, WebXR session negotiations, and room geometries, VOL implements a dedicated adapter (`VolXrAdapter`) that encapsulates verified VXR Core APIs without introducing regressions.

```
┌────────────────────────────────────────────────────────┐
│             VOL Web Application (React 19)             │
├────────────────────────────────────────────────────────┤
│          VolXrAdapter (@vickora/vol-xr)                │
│    • Optical bench rail snapping                       │
│    • Millimeter precision carriers                     │
│    • Dynamic 3D physical ray pipeline                  │
├────────────────────────────────────────────────────────┤
│           VXR Core Runtime (@vxr/core v0.1.0)          │
│    • XRApp (lifecycle, loop, scene)                    │
│    • XRRoom & XRScenario (procedural lab & collisions) │
│    • XRSession (immersive-vr, controller rays)         │
│    • XRInput (unified 6DoF & desktop controls)         │
│    • WebXRRuntime (Quest framerate negotiation)        │
├────────────────────────────────────────────────────────┤
│          Three.js (r174) & WebGL / WebXR API           │
└────────────────────────────────────────────────────────┘
```

---

## 2. WebXR Lifecycle & Meta Quest 3S Optimizations

### 2.1 Framerate Negotiation
Meta Quest 3S displays support dynamic display refresh rates (72 Hz, 90 Hz, and 120 Hz).
To preserve the 13.9 ms frame budget and prevent GPU thermal throttling during complex ray tracing and mesh rendering:
- VXR Core's `WebXRRuntime` queries `session.supportedFrameRates`.
- Negotiates a target rate of **90 Hz** (or 72 Hz fallback).
- Clamps pixel ratio between $1.0$ and $1.25$ via `renderer.setPixelRatio()`.

### 2.2 Controller Interaction & Ray Grabbing
- Target ray controllers (Index 0: Right / Primary, Index 1: Left / Secondary) render cyan laser pointers in 3D space.
- Pulling the index trigger emits the unified `select` event.
- Raycasts test against carrier bounding boxes and bench geometry.
- Optical components snap to the optical bench rail along the continuous Z-axis with 1 mm increments.

### 2.3 State Preservation
Transitioning between desktop mode and WebXR does not reset simulation parameters.
All physical variables (incident angle, focal length, slit separation, recorded measurements) persist continuously across session boundary transitions (`sessionstart` and `sessionend`).
