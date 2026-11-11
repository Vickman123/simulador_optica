import * as THREE from 'three';
import { XRApp } from '@vxr/core';
import {
  createOpticalTable,
  createOpticalRail,
  createLaserSource,
  createMountedLens,
  createObservationScreen,
  createSemiCylindricalBlock,
  createLaserRayMesh,
} from './procedural/instruments.js';
import {
  calculateFresnel,
  calculateThinLens,
  calculateDoubleSlit,
  Vector3,
} from '@vickora/optics-engine';
import { getMaterial, getRefractiveIndex } from '@vickora/vol-data';
import { wavelengthToRGB } from '@vickora/shared';

export interface StationDefinition {
  id: string;
  name: string;
  title: string;
  category: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  status: 'active' | 'roadmap';
  tableGroup?: THREE.Group;
}

export class VolXrAdapter {
  public readonly app: XRApp;
  public readonly stations: Map<string, StationDefinition> = new Map();
  private activeStationId: string = 'geometric';
  private dynamicRayGroup: THREE.Group;
  private currentExperimentState: Record<string, any> = {};

  // Interactive station instrument references
  private geometricLaser: THREE.Group | null = null;
  private geometricBlock: THREE.Mesh | null = null;
  private lensesTarget: THREE.Group | null = null;
  private lensesOptic: THREE.Group | null = null;
  private lensesScreen: THREE.Group | null = null;

  constructor(container?: HTMLElement) {
    // 1. Initialize VXR Core XRApp (autoVRButton: false to prevent DOM button overlap)
    this.app = new XRApp({
      container,
      autoVRButton: false,
      autoOrbitControls: true,
      cameraPosition: [-4.2 + 0.55, 1.35, -2.5 + 0.85],
      targetFrameRate: 90,
      questOptimization: true,
    });

    // Set deep laboratory background atmosphere
    this.app.scene.setBackground(0x0a0e17);

    // 2. Setup dynamic ray container
    this.dynamicRayGroup = new THREE.Group();
    this.dynamicRayGroup.name = 'VOL_DynamicOpticalRays';
    this.app.scene.nativeScene.add(this.dynamicRayGroup);

    // 3. Procedural architectural laboratory room via VXR Core
    this.setupLaboratoryRoom();

    // 4. Construct the six scientific experimental stations
    this.setupExperimentalStations();

    // 5. Initial Camera framing on Station A
    this.navigateToStation('geometric');

    // 6. Subscribe to animation frame loop for dynamic optical updates
    this.app.onUpdate((delta, elapsed) => {
      this.updateSimulation(delta, elapsed);
    });
  }

  private setupLaboratoryRoom(): void {
    // Construct spacious university optics research laboratory
    this.app.createRoom({
      id: 'optics-lab-main',
      name: 'Vickora Labs Optics Research Facility',
      dimensions: { width: 18, depth: 16, height: 4.2 },
      theme: 'scifi',
      floor: {
        color: 0x111827, // Clean dark laboratory slate
        roughness: 0.2,
        metalness: 0.3,
        grid: true,
      },
      walls: {
        color: 0x1f2937, // Professional research lab walls
        trimColor: 0x0284c7, // Ocean Cyan accents
        roughness: 0.4,
      },
      ceiling: {
        enabled: false,
      },
      lighting: {
        enabled: true,
        color: 0xffffff,
        intensity: 2.8,
      },
      spawnPoint: [-4.2 + 0.55, 1.35, -2.5 + 0.85],
    });

    // High-power interior illumination
    const interiorAmbient = new THREE.AmbientLight(0xffffff, 2.4);
    interiorAmbient.name = 'VOL_InteriorAmbient';
    this.app.scene.nativeScene.add(interiorAmbient);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    mainKeyLight.position.set(6, 8, 6);
    mainKeyLight.castShadow = true;
    this.app.scene.nativeScene.add(mainKeyLight);

    const secondaryFill = new THREE.DirectionalLight(0x38bdf8, 1.6);
    secondaryFill.position.set(-6, 8, -6);
    this.app.scene.nativeScene.add(secondaryFill);
  }

  private setupExperimentalStations(): void {
    const stationConfigs: StationDefinition[] = [
      {
        id: 'geometric',
        name: 'Station A',
        title: 'Geometrical Optics: Reflection & Snell Refraction',
        category: 'Geometrical Optics',
        position: [-4.2, 0, -2.5],
        lookAt: [-4.2, 0.9, -2.5],
        status: 'active',
      },
      {
        id: 'lenses',
        name: 'Station B',
        title: 'Lens Systems: Gaussian Thin Lens & Magnification',
        category: 'Imaging Systems',
        position: [0, 0, -2.5],
        lookAt: [0, 0.9, -2.5],
        status: 'active',
      },
      {
        id: 'wave',
        name: 'Station C',
        title: 'Wave Optics: Young’s Double Slit & Diffraction',
        category: 'Physical Optics',
        position: [4.2, 0, -2.5],
        lookAt: [4.2, 0.9, -2.5],
        status: 'active',
      },
      {
        id: 'polarization',
        name: 'Station D',
        title: 'Polarization & Malus Cascade',
        category: 'Polarization',
        position: [-4.2, 0, 2.5],
        lookAt: [-4.2, 0.9, 2.5],
        status: 'roadmap',
      },
      {
        id: 'laser',
        name: 'Station E',
        title: 'Laser Experiments & Interferometry',
        category: 'Coherent Optics',
        position: [0, 0, 2.5],
        lookAt: [0, 0.9, 2.5],
        status: 'roadmap',
      },
      {
        id: 'photonics',
        name: 'Station F',
        title: 'Photonics & Guided Waves',
        category: 'Fiber Optics',
        position: [4.2, 0, 2.5],
        lookAt: [4.2, 0.9, 2.5],
        status: 'roadmap',
      },
    ];

    stationConfigs.forEach((cfg) => {
      // 1. Heavy optical breadboard table
      const table = createOpticalTable(2.2, 1.1, 0.85);
      table.position.set(cfg.position[0], cfg.position[1], cfg.position[2]);
      this.app.scene.nativeScene.add(table);
      cfg.tableGroup = table;

      // Dedicated table spotlight for crystal-clear instrument visibility
      const tableSpot = new THREE.PointLight(0xffffff, 4.5, 6.0, 1.0);
      tableSpot.position.set(0, 1.8, 0);
      table.add(tableSpot);

      // 2. Optical rail on the table
      const rail = createOpticalRail(1.4);
      rail.position.set(0, 0.85, 0);
      table.add(rail);

      // 3. Station Signage Plaque
      this.createStationSign(table, cfg);

      // 4. Station-specific static hardware
      if (cfg.id === 'geometric') {
        this.setupGeometricHardware(table);
      } else if (cfg.id === 'lenses') {
        this.setupLensesHardware(table);
      } else if (cfg.id === 'wave') {
        this.setupWaveHardware(table);
      } else {
        // Roadmap stations have laser source and bench ready
        const laser = createLaserSource(532);
        laser.position.set(0, 0.85, -0.5);
        table.add(laser);
      }

      this.stations.set(cfg.id, cfg);
    });
  }

  private createStationSign(parent: THREE.Group, _cfg: StationDefinition): void {
    const signGroup = new THREE.Group();
    // Mount firmly on the front edge of the optical table to keep line of sight unobstructed
    signGroup.position.set(0, 0.78, 0.56);

    const plateGeo = new THREE.BoxGeometry(0.42, 0.065, 0.015);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep slate equipment badge
      metalness: 0.85,
      roughness: 0.2,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    signGroup.add(plate);

    const accentGeo = new THREE.BoxGeometry(0.4, 0.006, 0.018);
    const accentMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const accent = new THREE.Mesh(accentGeo, accentMat);
    accent.position.set(0, -0.02, 0.001);
    signGroup.add(accent);

    parent.add(signGroup);
  }

  private setupGeometricHardware(table: THREE.Group): void {
    // 1. Goniometer round protractor base plate (radius 0.26m)
    const baseGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.008, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.85,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, 0.854, 0);
    table.add(baseMesh);

    // Goniometer circular angle indicator ring
    const ringGeo = new THREE.RingGeometry(0.04, 0.24, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 0.859, 0);
    table.add(ringMesh);

    // Center mounting stage for the prism (height 0.09m)
    const stageGeo = new THREE.CylinderGeometry(0.082, 0.082, 0.09, 32);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.35,
      metalness: 0.8,
    });
    const stageMesh = new THREE.Mesh(stageGeo, stageMat);
    stageMesh.position.set(0, 0.85 + 0.045, 0);
    table.add(stageMesh);

    // 2. Semi-cylindrical glass block centered at optical axis height (0, 0.97, 0)
    const block = createSemiCylindricalBlock(0.08, 0.045);
    block.name = 'SemiCylindricalBlockMesh';
    block.position.set(0, 0.97, 0);
    table.add(block);
    this.geometricBlock = block;

    // 3. Precision laser source on goniometer arm
    const laser = createLaserSource(632.8);
    laser.name = 'GeometricLaser';
    laser.position.set(0, 0.85, -0.42);
    table.add(laser);
    this.geometricLaser = laser;
  }

  private setupLensesHardware(table: THREE.Group): void {
    // Optical rail along Z
    // Object target at Z = -0.35m
    const objScreen = createObservationScreen(0.12, 0.12);
    objScreen.name = 'LensesObjectTarget';
    objScreen.position.set(0, 0.85, -0.35);
    table.add(objScreen);
    this.lensesTarget = objScreen;

    // Mounted lens at Z = 0.0m
    const lens = createMountedLens(0.1, 0.08);
    lens.name = 'LensesMountedOptic';
    lens.position.set(0, 0.85, 0.0);
    table.add(lens);
    this.lensesOptic = lens;

    // Image projection screen at Z = +0.25m
    const imgScreen = createObservationScreen(0.16, 0.16);
    imgScreen.name = 'LensesProjectionScreen';
    imgScreen.position.set(0, 0.85, 0.25);
    table.add(imgScreen);
    this.lensesScreen = imgScreen;
  }

  private setupWaveHardware(table: THREE.Group): void {
    // Laser source at Z = -0.55m
    const laser = createLaserSource(532);
    laser.name = 'WaveLaserSource';
    laser.position.set(0, 0.85, -0.55);
    table.add(laser);

    // Double-slit slide holder at Z = -0.35m
    const slitHolder = createObservationScreen(0.06, 0.06);
    slitHolder.name = 'DoubleSlitSlide';
    slitHolder.position.set(0, 0.85, -0.35);
    table.add(slitHolder);

    // Observation screen at Z = +0.45m
    const screen = createObservationScreen(0.24, 0.14);
    screen.name = 'WaveInterferenceScreen';
    screen.position.set(0, 0.85, 0.45);
    table.add(screen);
  }

  /**
   * Smoothly navigates the camera to inspect a specific experimental station.
   */
  public navigateToStation(stationId: string): void {
    const station = this.stations.get(stationId);
    if (!station) return;
    this.activeStationId = stationId;

    const [px, , pz] = station.position;
    // Elevate camera for a comfortable 3/4 perspective overlooking the optical bench
    const targetCamPos: [number, number, number] = [px + 0.55, 1.35, pz + 0.85];
    const targetLookAt: [number, number, number] = [px, 0.97, pz];

    this.app.resetCamera(targetCamPos, targetLookAt);
  }

  /**
   * Updates physical parameters of the currently active experiment.
   */
  public setExperimentState(state: Record<string, any>): void {
    this.currentExperimentState = { ...this.currentExperimentState, ...state };
    this.rebuildOpticalRays();
  }

  /**
   * Dynamically constructs and updates the 3D laser rays based on physics calculations.
   */
  private rebuildOpticalRays(): void {
    // Clear previous dynamic rays
    while (this.dynamicRayGroup.children.length > 0) {
      const child = this.dynamicRayGroup.children[0];
      this.dynamicRayGroup.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
    }

    const station = this.stations.get(this.activeStationId);
    if (!station || !station.tableGroup) return;

    const tablePos = station.tableGroup.position;

    if (this.activeStationId === 'geometric') {
      const thetaDeg = this.currentExperimentState.incidentAngleDeg ?? 30;
      const wl = this.currentExperimentState.wavelengthNm ?? 632.8;
      const matId = this.currentExperimentState.materialId ?? 'nbk7';
      const mat = getMaterial(matId);
      const n2 = getRefractiveIndex(mat, wl);
      const n1 = 1.0; // Air

      // Update physical index of refraction in 3D prism material
      if (this.geometricBlock && (this.geometricBlock.material as THREE.MeshPhysicalMaterial)) {
        (this.geometricBlock.material as THREE.MeshPhysicalMaterial).ior = Math.min(2.4, Math.max(1.0, n2));
      }

      const thetaRad = (thetaDeg * Math.PI) / 180.0;
      const fresnel = calculateFresnel(thetaRad, n1, n2);

      // Height of optical axis is at 0.97m above ground
      const centerY = tablePos.y + 0.97;
      const center = new THREE.Vector3(tablePos.x, centerY, tablePos.z);

      const beamRadius = 0.0035; // 3.5mm visible laser core
      const beamReach = 0.42;

      // Incident ray: coming from angle theta
      const incStartX = tablePos.x + Math.sin(thetaRad) * beamReach;
      const incStartZ = tablePos.z - Math.cos(thetaRad) * beamReach;
      const incStart = new THREE.Vector3(incStartX, centerY, incStartZ);

      // Reposition and orient the actual 3D laser source on the goniometer!
      if (this.geometricLaser) {
        this.geometricLaser.position.set(incStartX, tablePos.y + 0.85, incStartZ);
        this.geometricLaser.lookAt(tablePos.x, centerY, tablePos.z);

        // Update emission LED indicator color
        const rgb = wavelengthToRGB(wl);
        const led = this.geometricLaser.getObjectByName('LaserEmissionLED') as THREE.Mesh;
        if (led && (led.material as THREE.MeshBasicMaterial).color) {
          (led.material as THREE.MeshBasicMaterial).color.set(rgb.hex);
        }
      }

      // 1. Draw incident ray from laser aperture to flat prism face
      this.dynamicRayGroup.add(createLaserRayMesh(incStart, center, wl, 1.0, beamRadius));

      // 2. Reflected ray: theta_r = theta_i into -Z region
      const reflEndX = tablePos.x - Math.sin(thetaRad) * beamReach;
      const reflEndZ = tablePos.z - Math.cos(thetaRad) * beamReach;
      const reflEnd = new THREE.Vector3(reflEndX, centerY, reflEndZ);
      const reflIntensity = fresnel.Runpolarized;
      if (reflIntensity > 0.002) {
        this.dynamicRayGroup.add(
          createLaserRayMesh(center, reflEnd, wl, Math.min(1.0, reflIntensity * 2.5), beamRadius * 0.85)
        );
      }

      // 3. Refracted ray through glass into +Z region
      if (!fresnel.isTIR && fresnel.thetaTransmittedRad !== null) {
        const thetaT = fresnel.thetaTransmittedRad;
        const refrEndX = tablePos.x - Math.sin(thetaT) * beamReach;
        const refrEndZ = tablePos.z + Math.cos(thetaT) * beamReach;
        const refrEnd = new THREE.Vector3(refrEndX, centerY, refrEndZ);
        this.dynamicRayGroup.add(
          createLaserRayMesh(center, refrEnd, wl, Math.min(1.0, fresnel.Tunpolarized * 1.2), beamRadius * 0.9)
        );
      }
    } else if (this.activeStationId === 'lenses') {
      const fMm = this.currentExperimentState.focalLengthMm ?? 100;
      const doMm = this.currentExperimentState.objectDistanceMm ?? 250;
      const hoMm = this.currentExperimentState.objectHeightMm ?? 20;

      const fM = fMm / 1000.0;
      const doM = doMm / 1000.0;
      const hoM = hoMm / 1000.0;

      const lensCalc = calculateThinLens(fM, doM, hoM, 0);

      // Move object target, lens curvature, and observation screen on rail
      if (this.lensesOptic) {
        this.lensesOptic.scale.set(1, 1, fMm < 0 ? 0.75 : 1.15);
      }
      if (this.lensesTarget) {
        this.lensesTarget.position.set(0, 0.85, -Math.min(0.6, doM));
      }
      if (this.lensesScreen && lensCalc.imageDistanceM > 0) {
        this.lensesScreen.position.set(0, 0.85, Math.min(0.65, lensCalc.imageDistanceM));
      }

      const tableCenter = new THREE.Vector3(tablePos.x, tablePos.y + 0.97, tablePos.z);
      const wl = 532; // Green laser rays

      // Draw principal construction rays
      const rays = lensCalc.principalRays;
      const drawRay = (pts: Vector3[]) => {
        for (let i = 0; i < pts.length - 1; i++) {
          const p1 = new THREE.Vector3(
            tableCenter.x + pts[i].x,
            tableCenter.y + pts[i].y,
            tableCenter.z + pts[i].z
          );
          const p2 = new THREE.Vector3(
            tableCenter.x + pts[i + 1].x,
            tableCenter.y + pts[i + 1].y,
            tableCenter.z + pts[i + 1].z
          );
          this.dynamicRayGroup.add(createLaserRayMesh(p1, p2, wl, 0.9, 0.0028));
        }
      };

      drawRay(rays.parallelRay);
      drawRay(rays.centralRay);
      drawRay(rays.focalRay);
    } else if (this.activeStationId === 'wave') {
      const wl = this.currentExperimentState.wavelengthNm ?? 532;
      const dMm = this.currentExperimentState.slitSeparationMm ?? 0.25;
      const aMm = this.currentExperimentState.slitWidthMm ?? 0.04;
      const LM = this.currentExperimentState.screenDistanceM ?? 1.2;

      const dM = dMm / 1000.0;
      const aM = aMm / 1000.0;

      const waveCalc = calculateDoubleSlit({
        wavelengthNm: wl,
        slitSeparationM: dM,
        slitWidthM: aM,
        screenDistanceM: LM,
      });

      const tableCenter = new THREE.Vector3(tablePos.x, tablePos.y + 0.97, tablePos.z);

      // Laser to slits
      const laserPoint = new THREE.Vector3(tableCenter.x, tableCenter.y, tableCenter.z - 0.55);
      const slitPoint = new THREE.Vector3(tableCenter.x, tableCenter.y, tableCenter.z - 0.25);
      this.dynamicRayGroup.add(createLaserRayMesh(laserPoint, slitPoint, wl, 1.0, 0.0035));

      // Dual coherent beams fanning out to screen
      const screenZ = tableCenter.z - 0.25 + LM * 0.45;
      [-waveCalc.fringeSpacingM * 3, 0, waveCalc.fringeSpacingM * 3].forEach((offsetY) => {
        const screenHit = new THREE.Vector3(
          tableCenter.x + offsetY * 12,
          tableCenter.y,
          screenZ
        );
        this.dynamicRayGroup.add(createLaserRayMesh(slitPoint, screenHit, wl, 0.75, 0.0025));
      });
    }
  }

  private updateSimulation(_delta: number, _elapsed: number): void {
    // Real-time animation step
  }

  /**
   * Starts the simulation rendering loop.
   */
  public start(): this {
    this.app.start();
    this.navigateToStation('geometric');
    this.rebuildOpticalRays();
    return this;
  }

  /**
   * Cleans up all resources, GPU allocations, and listeners.
   */
  public dispose(): void {
    this.app.stop();
  }
}
