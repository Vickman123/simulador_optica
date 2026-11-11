import * as THREE from 'three';
import { wavelengthToRGB } from '@vickora/shared';

/**
 * Procedural generation of professional scientific optical laboratory furniture and instruments.
 * All dimensions are in SI units (meters).
 */

/**
 * Creates a vibration-isolated optical research breadboard table.
 */
export function createOpticalTable(
  width: number = 2.4, // 2.4 meters wide
  depth: number = 1.2, // 1.2 meters deep
  height: number = 0.85 // 85 cm table height
): THREE.Group {
  const tableGroup = new THREE.Group();
  tableGroup.name = 'OpticalBreadboardTable';

  // 1. Breadboard Top Plate (Black anodized aluminum with grid texture)
  const topPlateThickness = 0.1;
  const topGeo = new THREE.BoxGeometry(width, topPlateThickness, depth);
  const topMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f, // Deep graphite / black anodized aluminum
    roughness: 0.35,
    metalness: 0.8,
  });
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.position.y = height - topPlateThickness / 2;
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  tableGroup.add(topMesh);

  // Optical grid lines on top surface (simulating 25mm M6 tapped holes)
  const gridHelper = new THREE.GridHelper(Math.min(width, depth), 20, 0x334155, 0x1e293b);
  gridHelper.position.y = height + 0.001;
  gridHelper.scale.set(width / Math.min(width, depth), 1, depth / Math.min(width, depth));
  tableGroup.add(gridHelper);

  // 2. Pneumatic Vibration-Isolation Legs (4 heavy steel pillars)
  const legRadius = 0.06;
  const legHeight = height - topPlateThickness;
  const legGeo = new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 16);
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Steel dark blue-gray
    roughness: 0.5,
    metalness: 0.6,
  });

  const legOffsetX = width / 2 - 0.15;
  const legOffsetZ = depth / 2 - 0.15;
  const legPositions = [
    [-legOffsetX, -legOffsetZ],
    [legOffsetX, -legOffsetZ],
    [-legOffsetX, legOffsetZ],
    [legOffsetX, legOffsetZ],
  ];

  legPositions.forEach(([x, z]) => {
    const legMesh = new THREE.Mesh(legGeo, legMat);
    legMesh.position.set(x, legHeight / 2, z);
    legMesh.castShadow = true;
    tableGroup.add(legMesh);
  });

  return tableGroup;
}

/**
 * Creates an extruded aluminum optical rail with millimeter scale markings.
 */
export function createOpticalRail(lengthM: number = 1.5): THREE.Group {
  const railGroup = new THREE.Group();
  railGroup.name = 'PrecisionOpticalRail';

  const railWidth = 0.095; // 95mm standard optical rail
  const railHeight = 0.04;

  const railGeo = new THREE.BoxGeometry(railWidth, railHeight, lengthM);
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x64748b, // Matte anodized aluminum
    roughness: 0.25,
    metalness: 0.9,
  });

  const railMesh = new THREE.Mesh(railGeo, railMat);
  railMesh.position.y = railHeight / 2;
  railMesh.castShadow = true;
  railMesh.receiveShadow = true;
  railGroup.add(railMesh);

  // Central guide slot
  const slotGeo = new THREE.BoxGeometry(railWidth * 0.3, railHeight * 0.3, lengthM);
  const slotMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
  });
  const slotMesh = new THREE.Mesh(slotGeo, slotMat);
  slotMesh.position.y = railHeight - (railHeight * 0.15);
  railGroup.add(slotMesh);

  return railGroup;
}

/**
 * Creates an optical carrier slider that mounts onto the optical rail.
 */
export function createRailCarrier(label: string = 'Carrier'): THREE.Group {
  const carrier = new THREE.Group();
  carrier.name = `Carrier_${label}`;

  const baseGeo = new THREE.BoxGeometry(0.09, 0.025, 0.06);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Black anodized finish
    roughness: 0.4,
    metalness: 0.7,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.0125;
  baseMesh.castShadow = true;
  carrier.add(baseMesh);

  // Vertical support post
  const postGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 16);
  const postMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // Stainless steel post
    roughness: 0.2,
    metalness: 0.95,
  });
  const postMesh = new THREE.Mesh(postGeo, postMat);
  postMesh.position.y = 0.025 + 0.075;
  postMesh.castShadow = true;
  carrier.add(postMesh);

  return carrier;
}

/**
 * Creates a precision laser source with beam emitter aperture and status indicator.
 */
export function createLaserSource(wavelengthNm: number = 632.8): THREE.Group {
  const laser = new THREE.Group();
  laser.name = 'LaserSource';

  // Cylindrical housing
  const bodyGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.18, 24);
  bodyGeo.rotateX(Math.PI / 2); // Orient along Z axis
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.3,
    metalness: 0.8,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.18;
  bodyMesh.castShadow = true;
  laser.add(bodyMesh);

  // Emitter aperture face (brass ring)
  const ringGeo = new THREE.TorusGeometry(0.022, 0.003, 16, 24);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Brass/gold accent
    roughness: 0.2,
    metalness: 0.9,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.set(0, 0.18, 0.09);
  laser.add(ringMesh);

  // Emission LED indicator
  const rgb = wavelengthToRGB(wavelengthNm);
  const ledGeo = new THREE.SphereGeometry(0.004, 16, 16);
  const ledMat = new THREE.MeshBasicMaterial({
    color: rgb.hex,
  });
  const ledMesh = new THREE.Mesh(ledGeo, ledMat);
  ledMesh.position.set(0, 0.205, -0.05);
  laser.add(ledMesh);

  return laser;
}

/**
 * Creates an optical lens in an anodized circular mounting cell.
 */
export function createMountedLens(
  _focalLengthM: number = 0.1,
  diameterM: number = 0.06
): THREE.Group {
  const mount = new THREE.Group();
  mount.name = 'MountedLens';

  // Outer circular mount ring
  const ringGeo = new THREE.CylinderGeometry(diameterM / 2 + 0.008, diameterM / 2 + 0.008, 0.012, 32);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.3,
    metalness: 0.8,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.y = 0.18;
  ringMesh.castShadow = true;
  mount.add(ringMesh);

  // Glass optic element
  const glassGeo = new THREE.CylinderGeometry(diameterM / 2, diameterM / 2, 0.006, 32);
  glassGeo.rotateX(Math.PI / 2);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.05,
    transmission: 0.95,
    ior: 1.5168,
    metalness: 0.0,
    reflectivity: 0.5,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.position.y = 0.18;
  mount.add(glassMesh);

  return mount;
}

/**
 * Creates an observation screen with projection reticle for viewing spots and fringes.
 */
export function createObservationScreen(
  widthM: number = 0.16,
  heightM: number = 0.16
): THREE.Group {
  const screen = new THREE.Group();
  screen.name = 'ObservationScreen';

  // Screen Frame
  const frameGeo = new THREE.BoxGeometry(widthM + 0.02, heightM + 0.02, 0.01);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
  });
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.y = 0.18;
  frameMesh.castShadow = true;
  screen.add(frameMesh);

  // Projection target surface (matte white)
  const targetGeo = new THREE.PlaneGeometry(widthM, heightM);
  const targetMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Clean matte white
    roughness: 0.95,
    metalness: 0.0,
  });
  const targetMesh = new THREE.Mesh(targetGeo, targetMat);
  targetMesh.position.set(0, 0.18, -0.006);
  targetMesh.receiveShadow = true;
  screen.add(targetMesh);

  return screen;
}

/**
 * Creates a precision semi-cylindrical optical prism block for Snell's Law and TIR experiments.
 * The flat entrance/exit face is at z = 0 with normal pointing towards -Z.
 */
export function createSemiCylindricalBlock(radiusM: number = 0.08, heightM: number = 0.045): THREE.Mesh {
  const shape = new THREE.Shape();
  // Flat diameter along X from -radius to +radius
  shape.moveTo(-radiusM, 0);
  shape.lineTo(radiusM, 0);
  // Semicircle arc in +Y
  shape.absarc(0, 0, radiusM, 0, Math.PI, false);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: heightM,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.0015,
    bevelThickness: 0.0015,
  });

  // Rotate and center so flat face normal points in -Z, arc in +Z, and vertical height is centered at y = 0
  geo.rotateX(Math.PI / 2);
  geo.translate(0, heightM / 2, 0);

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe, // Optical crown glass tint
    transparent: true,
    opacity: 0.7,
    roughness: 0.04,
    transmission: 0.95,
    ior: 1.5168,
    reflectivity: 0.85,
    metalness: 0.0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'SemiCylindricalGlassBlock';
  mesh.castShadow = true;
  return mesh;
}

/**
 * Renders an active 3D laser beam segment with realistic photon glow.
 */
export function createLaserRayMesh(
  start: THREE.Vector3,
  end: THREE.Vector3,
  wavelengthNm: number,
  intensity: number = 1.0,
  beamRadius: number = 0.0018
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ActiveLaserBeamSegment';

  const dir = new THREE.Vector3().subVectors(end, start);
  const len = dir.length();
  if (len < 1e-4) return group;

  const rgb = wavelengthToRGB(wavelengthNm);
  const clampedIntensity = Math.min(1.0, Math.max(0.05, intensity));

  // 1. Core high-intensity beam
  const coreGeo = new THREE.CylinderGeometry(beamRadius, beamRadius, len, 8);
  const coreMat = new THREE.MeshBasicMaterial({
    color: rgb.hex,
    transparent: true,
    opacity: clampedIntensity * 0.9,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);

  // Position and orient cylinder between start and end
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  coreMesh.position.copy(midPoint);
  coreMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  group.add(coreMesh);

  // 2. Diffuse atmospheric halo glow
  const haloGeo = new THREE.CylinderGeometry(beamRadius * 2.8, beamRadius * 2.8, len, 8);
  const haloMat = new THREE.MeshBasicMaterial({
    color: rgb.hex,
    transparent: true,
    opacity: clampedIntensity * 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloMesh.position.copy(midPoint);
  haloMesh.quaternion.copy(coreMesh.quaternion);
  group.add(haloMesh);

  return group;
}
