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
    // 1. Initialize VXR Core XRApp (autoVRButton: false to prevent DOM button overlap)
    this.app = new XRApp({
      container,
      autoVRButton: false,
      autoOrbitControls: true,
      cameraPosition: [-4.2, 1.25, -1.3],
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

    // 5. Initial Camera framing on Station A
    this.navigateToStation('geometric');

    // 6. Subscribe to animation frame loop for dynamic optical updates
    this.app.onUpdate((delta, elapsed) => {
      this.updateSimulation(delta, elapsed);
    });
  }

  private setupLaboratoryRoom(): void {
    // Construct spacious university optics research laboratory
    // Setting ceiling: enabled: false allows bright ambient & directional lights to illuminate the entire lab
    this.app.createRoom({
      id: 'optics-lab-main',
      name: 'Vickora Labs Optics Research Facility',
      dimensions: { width: 18, depth: 16, height: 4.2 },
      theme: 'scifi',
      floor: {
        color: 0x0f172a, // Deep laboratory slate
        roughness: 0.15,
        metalness: 0.25,
        grid: true,
      },
      walls: {
        color: 0x1e293b, // Clean tech graphite walls
        trimColor: 0x0ea5e9, // Vickora Cyan accents
        roughness: 0.4,
      },
      ceiling: {
        enabled: false,
      },
      lighting: {
        enabled: true,
        color: 0xffffff,
        intensity: 2.5,
      },
      spawnPoint: [-4.2, 1.25, -1.3],
    });

    // High-power interior illumination
    const interiorAmbient = new THREE.AmbientLight(0xffffff, 2.2);
    interiorAmbient.name = 'VOL_InteriorAmbient';
    this.app.scene.nativeScene.add(interiorAmbient);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    mainKeyLight.position.set(6, 8, 6);
    mainKeyLight.castShadow = true;
    this.app.scene.nativeScene.add(mainKeyLight);

    const secondaryFill = new THREE.DirectionalLight(0x38bdf8, 1.5);
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

    // Goniometer circular protractor on table surface
    const ringGeo = new THREE.RingGeometry(0.02, 0.16, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 0.852, 0);
    table.add(ringMesh);

    // Semi-cylindrical glass block at center (0, 0.85, 0)
    const block = createSemiCylindricalBlock(0.08, 0.04);
    block.name = 'SemiCylindricalBlockMesh';
    block.position.set(0, 0.87, 0);
    table.add(block);
  }

  private setupLensesHardware(table: THREE.Group): void {
    // Optical rail along Z
    // Object target at Z = -0.45m
    const objScreen = createObservationScreen(0.1, 0.1);
    objScreen.name = 'LensesObjectTarget';
    objScreen.position.set(0, 0.85, -0.45);
    table.add(objScreen);

    // Mounted lens at Z = -0.15m
    const lens = createMountedLens(0.1, 0.08);
    lens.name = 'LensesMountedOptic';
    lens.position.set(0, 0.85, -0.15);
    table.add(lens);

    // Image projection screen at Z = +0.25m
    const imgScreen = createObservationScreen(0.16, 0.16);
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
    // Position camera 1.1m in front of table, 1.25m height, looking at center of bench (0.95m height)
    const targetCamPos: [number, number, number] = [px, 1.25, pz + 1.1];
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

      // Height of laser beam is at table surface (0.85m) + optical post (0.18m) = 1.03m
      const centerY = tablePos.y + 0.85 + 0.02;
      const center = new THREE.Vector3(tablePos.x, centerY, tablePos.z);

      const beamRadius = 0.0035; // 3.5mm visible laser core
      const beamReach = 0.55;

      // Incident ray: coming from angle theta
      const incStart = new THREE.Vector3(
        center.x + Math.sin(thetaRad) * beamReach,
        centerY,
        center.z - Math.cos(thetaRad) * beamReach
      );
      this.dynamicRayGroup.add(createLaserRayMesh(incStart, center, wl, 1.0, beamRadius));

      // Reflected ray: theta_r = theta_i
      const reflEnd = new THREE.Vector3(
        center.x - Math.sin(thetaRad) * beamReach,
        centerY,
        center.z - Math.cos(thetaRad) * beamReach
      );
      this.dynamicRayGroup.add(
        createLaserRayMesh(center, reflEnd, wl, Math.max(0.18, fresnel.Runpolarized), beamRadius * 0.85)
      );

      // Refracted ray (if not Total Internal Reflection)
      if (!fresnel.isTIR && fresnel.thetaTransmittedRad !== null) {
        const thetaT = fresnel.thetaTransmittedRad;
        const refrEnd = new THREE.Vector3(
          center.x - Math.sin(thetaT) * beamReach,
          centerY,
          center.z + Math.cos(thetaT) * beamReach
        );
        this.dynamicRayGroup.add(
          createLaserRayMesh(center, refrEnd, wl, Math.max(0.18, fresnel.Tunpolarized), beamRadius * 0.9)
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

      const tableCenter = new THREE.Vector3(tablePos.x, tablePos.y + 0.85 + 0.18, tablePos.z);

      // Laser to slits
      const laserPoint = new THREE.Vector3(tableCenter.x, tableCenter.y, tableCenter.z - 0.55);
      const slitPoint = new THREE.Vector3(tableCenter.x, tableCenter.y, tableCenter.z - 0.35);
      this.dynamicRayGroup.add(createLaserRayMesh(laserPoint, slitPoint, wl, 1.0, 0.0035));

      // Dual coherent beams fanning out to screen
      const screenZ = tableCenter.z - 0.35 + LM * 0.5;
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
