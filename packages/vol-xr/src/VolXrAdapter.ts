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

  constructor(container?: HTMLElement) {
    // 1. Initialize VXR Core XRApp
    this.app = new XRApp({
      container,
      autoVRButton: true,
      autoOrbitControls: true,
      cameraPosition: [0, 1.6, 5],
      targetFrameRate: 90,
      questOptimization: true,
    });

    // 2. Setup dynamic ray container
    this.dynamicRayGroup = new THREE.Group();
    this.dynamicRayGroup.name = 'VOL_DynamicOpticalRays';
    this.app.scene.nativeScene.add(this.dynamicRayGroup);

    // 3. Procedural architectural laboratory room via VXR Core
    this.setupLaboratoryRoom();

    // 4. Construct the six scientific experimental stations
    this.setupExperimentalStations();

    // 5. Subscribe to animation frame loop for dynamic optical updates
    this.app.onUpdate((delta, elapsed) => {
      this.updateSimulation(delta, elapsed);
    });
  }

  private setupLaboratoryRoom(): void {
    // Construct spacious 16m x 14m university research laboratory
    this.app.createRoom({
      id: 'optics-lab-main',
      name: 'Vickora Labs Optics Research Facility',
      dimensions: { width: 16, depth: 14, height: 3.8 },
      theme: 'scifi',
      floor: {
        color: 0x0f172a, // Deep laboratory slate
        roughness: 0.2,
        metalness: 0.1,
        grid: true,
      },
      walls: {
        color: 0x1e293b, // Tech graphite walls
        trimColor: 0x0ea5e9, // Vickora Cyan accents
        roughness: 0.5,
      },
      ceiling: {
        enabled: true,
        color: 0x0f172a,
        lamps: true,
      },
      lighting: {
        enabled: true,
        color: 0xffffff,
        intensity: 2.2,
      },
      spawnPoint: [0, 1.6, 4.5],
    });

    // Add subtle ambient safety sign glow and directional lab lighting
    const dirLight = new THREE.DirectionalLight(0xf8fafc, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    this.app.scene.nativeScene.add(dirLight);

    return;
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
    signGroup.position.set(0, 1.05, -0.52);

    const plateGeo = new THREE.BoxGeometry(0.6, 0.12, 0.01);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vickora Ocean Blue
      metalness: 0.6,
      roughness: 0.2,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    signGroup.add(plate);

    parent.add(signGroup);
  }

  private setupGeometricHardware(table: THREE.Group): void {
    // Laser source at -0.45m on rail
    const laser = createLaserSource(632.8);
    laser.name = 'GeometricLaser';
    laser.position.set(0, 0.85, -0.45);
    table.add(laser);

    // Semi-cylindrical glass block at center (0, 0.85, 0)
    const block = createSemiCylindricalBlock(0.06, 0.03);
    block.name = 'SemiCylindricalBlockMesh';
    block.position.set(0, 0.865, 0);
    table.add(block);
  }

  private setupLensesHardware(table: THREE.Group): void {
    // Optical rail along Z
    // Object holder at Z = -0.45m
    const objScreen = createObservationScreen(0.08, 0.08);
    objScreen.name = 'LensesObjectTarget';
    objScreen.position.set(0, 0.85, -0.45);
    table.add(objScreen);

    // Mounted lens at Z = -0.15m
    const lens = createMountedLens(0.1, 0.06);
    lens.name = 'LensesMountedOptic';
    lens.position.set(0, 0.85, -0.15);
    table.add(lens);

    // Image projection screen at Z = +0.25m
    const imgScreen = createObservationScreen(0.14, 0.14);
    imgScreen.name = 'LensesProjectionScreen';
    imgScreen.position.set(0, 0.85, 0.25);
    table.add(imgScreen);
  }

  private setupWaveHardware(table: THREE.Group): void {
    // Laser source at Z = -0.55m
    const laser = createLaserSource(532);
    laser.name = 'WaveLaserSource';
    laser.position.set(0, 0.85, -0.55);
    table.add(laser);

    // Double-slit slide holder at Z = -0.35m
    const slitHolder = createObservationScreen(0.05, 0.05);
    slitHolder.name = 'DoubleSlitSlide';
    slitHolder.position.set(0, 0.85, -0.35);
    table.add(slitHolder);

    // Observation screen at Z = +0.45m
    const screen = createObservationScreen(0.2, 0.12);
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
    // Stand 1.6m tall, 1.4m away from table in front
    const targetCamPos: [number, number, number] = [px, 1.35, pz + 1.2];
    const targetLookAt: [number, number, number] = [px, 0.95, pz];

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

      const thetaRad = (thetaDeg * Math.PI) / 180.0;
      const fresnel = calculateFresnel(thetaRad, n1, n2);

      // Origin at table center (X, Y=0.85+0.18=1.03, Z)
      const center = new THREE.Vector3(tablePos.x, tablePos.y + 1.03, tablePos.z);

      // Incident ray: coming from angle theta
      const incStart = new THREE.Vector3(
        center.x + Math.sin(thetaRad) * 0.5,
        center.y,
        center.z - Math.cos(thetaRad) * 0.5
      );
      this.dynamicRayGroup.add(createLaserRayMesh(incStart, center, wl, 1.0));

      // Reflected ray: theta_r = theta_i
      const reflEnd = new THREE.Vector3(
        center.x - Math.sin(thetaRad) * 0.45,
        center.y,
        center.z - Math.cos(thetaRad) * 0.45
      );
      this.dynamicRayGroup.add(
        createLaserRayMesh(center, reflEnd, wl, fresnel.Runpolarized)
      );

      // Refracted ray (if not Total Internal Reflection)
      if (!fresnel.isTIR && fresnel.thetaTransmittedRad !== null) {
        const thetaT = fresnel.thetaTransmittedRad;
        const refrEnd = new THREE.Vector3(
          center.x - Math.sin(thetaT) * 0.45,
          center.y,
          center.z + Math.cos(thetaT) * 0.45
        );
        this.dynamicRayGroup.add(
          createLaserRayMesh(center, refrEnd, wl, fresnel.Tunpolarized)
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

      const tableCenter = new THREE.Vector3(tablePos.x, tablePos.y + 0.85 + 0.18, tablePos.z);
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
          this.dynamicRayGroup.add(createLaserRayMesh(p1, p2, wl, 0.85));
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

      const tableCenter = new THREE.Vector3(tablePos.x, tablePos.y + 0.85 + 0.18, tablePos.z);

      // Laser to slits
      const laserPoint = new THREE.Vector3(tableCenter.x, tableCenter.y, tableCenter.z - 0.55);
      const slitPoint = new THREE.Vector3(tableCenter.x, tableCenter.y, tableCenter.z - 0.35);
      this.dynamicRayGroup.add(createLaserRayMesh(laserPoint, slitPoint, wl, 1.0));

      // Dual coherent beams fanning out to screen
      const screenZ = tableCenter.z - 0.35 + LM * 0.5; // Scaled for table dimension
      [-waveCalc.fringeSpacingM * 3, 0, waveCalc.fringeSpacingM * 3].forEach((offsetY) => {
        const screenHit = new THREE.Vector3(
          tableCenter.x + offsetY * 10, // Enhanced visual scale for 3D visibility
          tableCenter.y,
          screenZ
        );
        this.dynamicRayGroup.add(createLaserRayMesh(slitPoint, screenHit, wl, 0.6));
      });
    }
  }

  private updateSimulation(_delta: number, _elapsed: number): void {
    // Dynamic optical updates on frame if needed
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
