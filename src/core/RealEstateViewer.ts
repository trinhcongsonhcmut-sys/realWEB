import * as THREE from 'three';
import { PropertyMetadata, ViewMode } from '../types';
import { EventEmitter } from './EventEmitter';
import { TownhouseBuilder } from './TownhouseBuilder';
import { LightingManager } from './LightingManager';
import { CameraStateMachine } from '../camera/CameraStateMachine';
import { HotspotsManager } from './HotspotsManager';
import { GlbModelLoader } from '../loaders/GlbModelLoader';
import { FurnitureManager } from './FurnitureManager';
import { HouseManager } from './HouseManager';
import { WaypointRecorder } from '../camera/WaypointRecorder';
import { MaterialCustomizer } from '../staging/MaterialCustomizer';
import { getHousePreset } from '../presets/houses';
import { getCameraPathPreset } from '../presets/camera-paths';
import { HouseNavigationConfig } from '../config/houseNavigationConfig';
import { VideoScrollerController } from '../video/VideoScrollerController';
import { GlbFreeExplorationController } from '../camera/GlbFreeExplorationController';

export class RealEstateViewer {
  public container: HTMLElement;
  public emitter: EventEmitter;

  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public clock: THREE.Clock;

  public houseManager: HouseManager;
  public townhouse: TownhouseBuilder;
  public lighting: LightingManager;
  public cameraController: CameraStateMachine;
  public glbFreeController: GlbFreeExplorationController;
  public videoScroller: VideoScrollerController;
  public hotspots: HotspotsManager;
  public furniture: FurnitureManager;
  public waypointRecorder: WaypointRecorder;
  public materialCustomizer: MaterialCustomizer = new MaterialCustomizer();

  public propertyData: PropertyMetadata;
  private isRunning: boolean = true;
  private animationFrameId: number = 0;

  constructor(container: HTMLElement, propertyData: PropertyMetadata, emitter: EventEmitter) {
    this.container = container;
    this.propertyData = propertyData;
    this.emitter = emitter;
    this.clock = new THREE.Clock();

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8cbbe5); // Crisp summer blue sky matching image.png
    this.scene.fog = new THREE.FogExp2(0xb6d6f2, 0.008);

    // 2. Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);
    this.camera.position.set(12.0, 7.0, 16.0);

    // 3. WebGLRenderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(this.renderer.domElement);

    // Initialize Video Scroller for seamless video-to-3D handover
    const appContainer = container.parentElement || container;
    this.videoScroller = new VideoScrollerController(appContainer, container, this.emitter);

    // 4. Initialize Core 3D Modules
    this.lighting = new LightingManager(this.scene, this.renderer);
    
    // Initialize Modular House Manager (loads default Townhouse)
    this.houseManager = new HouseManager(this.scene, this.emitter);
    this.townhouse = this.houseManager.townhouseBuilder || new TownhouseBuilder();

    this.hotspots = new HotspotsManager(this.scene, this.camera, this.emitter);
    this.hotspots.initHotspots(this.propertyData.hotspots);

    this.cameraController = new CameraStateMachine(this.camera, this.renderer.domElement, this.emitter);
    this.waypointRecorder = new WaypointRecorder(this.camera, this.cameraController, this.emitter);

    // Initialize GLB Free Exploration Controller (OrbitControls + Pan + Zoom + WASD)
    this.glbFreeController = new GlbFreeExplorationController(this.camera, this.renderer.domElement, this.emitter);

    // Initialize Furniture & Decor Manager
    this.furniture = new FurnitureManager(this.scene, this.camera, this.renderer.domElement, this.emitter);
    // Pause camera rotation while dragging furniture items
    this.cameraController.isInteractionBlocked = () => this.furniture.isInteracting();
    this.glbFreeController.isInteractionBlocked = () => this.furniture.isInteracting();

    // Sync door opening progress with scroll walkthrough
    this.cameraController.onDoorProgress = (progress: number) => {
      this.houseManager.setDoorOpenProgress(progress);
    };

    // Make procedural living room and interior space open and unobstructed from front to back
    this.houseManager.setLivingFurnitureVisibility(true);

    // Apply default camera walkthrough path for current house preset
    if (this.houseManager.currentPreset.defaultCameraPathId) {
      this.switchCameraPath(this.houseManager.currentPreset.defaultCameraPathId);
    }

    this.bindEvents();
    this.startRenderLoop();
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    // Click on 3D canvas for Hotspot selection (only trigger on clean clicks, not drags)
    let pointerDownPos = { x: 0, y: 0 };
    window.addEventListener('pointerdown', (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist < 6) { // It's a genuine click, not a drag
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.hotspots.handleClick(x, y, rect.width, rect.height);
      }
    });

    // Listen for UI view mode changes
    this.emitter.on<ViewMode>('view:mode-changed', (mode) => {
      this.lighting.setViewModeLighting(mode);

      // In dollhouse & floorplan modes, reveal interior by hiding roof
      if (mode === 'dollhouse' || mode === 'floorplan') {
        this.townhouse.setRoofVisibility(false);
        this.hotspots.setVisible(true);
        if (this.videoScroller) this.videoScroller.handleProgress(1.0);
      } else if (mode === 'interior') {
        this.townhouse.setRoofVisibility(true);
        this.hotspots.setVisible(false);
        if (this.videoScroller) this.videoScroller.handleProgress(1.0);
      } else {
        this.townhouse.setRoofVisibility(true);
        this.hotspots.setVisible(false);
      }
    });

    // Listen for automatic scroll arrival in room -> activate GLB free exploration
    this.emitter.on('camera:enter-free-glb', () => {
      if (!this.glbFreeController.isActive) {
        this.enterFreeGlbMode(GlbFreeExplorationController.DEFAULT_ROOM_POSITION, GlbFreeExplorationController.DEFAULT_ROOM_TARGET);
      }
    });

    // Listen for Hotspot selection -> fly camera to target room
    this.emitter.on('hotspot:selected', (hs: any) => {
      this.cameraController.setViewMode('interior', hs.cameraView);
    });
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
  };

  private onVisibilityChange = () => {
    if (document.hidden) {
      this.isRunning = false;
    } else {
      this.isRunning = true;
      this.clock.start();
      this.startRenderLoop();
    }
  };

  private startRenderLoop = () => {
    const loop = (time: number) => {
      if (!this.isRunning) return;

      const delta = Math.min(this.clock.getDelta(), 0.1);

      if (this.glbFreeController && this.glbFreeController.isActive) {
        this.glbFreeController.update(delta);
      } else if (this.waypointRecorder && this.waypointRecorder.isFreeFlightMode) {
        this.waypointRecorder.update(delta);
      } else {
        this.cameraController.update(time, delta);
      }
      this.lighting.update(delta);
      this.hotspots.update(delta);
      this.furniture.update(delta);
      this.videoScroller.update(delta);

      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(loop);
    };

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(loop);
  };

  public enterFreeGlbMode(targetPos?: THREE.Vector3, targetLookAt?: THREE.Vector3): void {
    // 1. Fully open the front door
    this.houseManager.setDoorOpenProgress(1.0);
    if (this.townhouse) {
      this.townhouse.setDoorOpenProgress(1.0);
    }

    // 2. Hide video scroller and ensure 3D WebGL scene is 100% visible and interactive
    if (this.videoScroller) {
      this.videoScroller.handleProgress(1.0);
    }
    this.container.style.opacity = '1';
    this.container.style.pointerEvents = 'auto';

    // 3. Deactivate standard interior look to avoid conflicting rotation
    this.cameraController.interiorController.deactivate();
    this.cameraController.scrollController.setProgress(1.0, true);

    // 4. Activate GLB Free Exploration Controller
    this.glbFreeController.enter(targetPos, targetLookAt, true);

    // 5. Notify UI that we are in interior mode
    this.emitter.emit('view:mode-changed', 'interior');
    this.emitter.emit('camera:scroll-progress', 1.0);
  }

  public exitFreeGlbMode(): void {
    this.glbFreeController.exit();
    this.cameraController.setViewMode('exterior');
    if (this.videoScroller) {
      this.videoScroller.handleProgress(0.0);
    }
  }

  public async switchHouse(presetId: string): Promise<void> {
    const preset = getHousePreset(presetId);
    await this.houseManager.loadHouse(preset);
    this.furniture.floorY = preset.floorHeight;

    if (preset.defaultCameraPathId) {
      this.switchCameraPath(preset.defaultCameraPathId);
    }
  }

  public switchCameraPath(pathPresetId: string): void {
    const pathPreset = getCameraPathPreset(pathPresetId);
    const navConfig: HouseNavigationConfig = {
      houseId: pathPreset.houseId,
      pathWaypoints: pathPreset.waypoints,
      doorOpenStartProgress: pathPreset.doorOpenStartProgress ?? 0.52,
      doorOpenCompleteProgress: pathPreset.doorOpenCompleteProgress ?? 0.65,
      scrollSensitivity: pathPreset.scrollSensitivity ?? 0.00025,
      progressDamping: pathPreset.progressDamping ?? 5.2,
      interiorLook: {
        stationPoint: pathPreset.interior360.stationPoint,
        initialTarget: pathPreset.interior360.initialTarget,
        maxPitch: pathPreset.interior360.maxPitch ?? Math.PI * 0.42,
        minPitch: pathPreset.interior360.minPitch ?? -Math.PI * 0.35,
        lookSensitivity: pathPreset.interior360.lookSensitivity ?? 0.0035,
        dampingFactor: pathPreset.interior360.dampingFactor ?? 12.0
      }
    };

    this.cameraController.config = navConfig;
    this.cameraController.pathController.updateConfig(navConfig);
    this.cameraController.scrollController.sensitivity = navConfig.scrollSensitivity;
    this.cameraController.scrollController.damping = navConfig.progressDamping;
    this.cameraController.interiorController.config = navConfig;

    this.cameraController.transitionToExteriorPath(0.0);
    this.emitter.emit('camera:path-preset-changed', pathPreset);
  }

  public setViewMode(mode: ViewMode): void {
    if (mode !== 'interior' && this.glbFreeController && this.glbFreeController.isActive) {
      this.glbFreeController.exit();
    }
    this.cameraController.setViewMode(mode);
  }

  public updateSofaColor(hex: string, roughness?: number): void {
    this.townhouse.updateSofaColor(hex, roughness);
    if (this.houseManager.glbHouseScene) {
      this.houseManager.glbHouseScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const lowerName = mesh.name.toLowerCase();
          if (lowerName.includes('sofa') && mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              if ((m as THREE.MeshStandardMaterial).color) {
                (m as THREE.MeshStandardMaterial).color.set(hex);
                if (roughness !== undefined) (m as THREE.MeshStandardMaterial).roughness = roughness;
                m.needsUpdate = true;
              }
            });
          }
        }
      });
    }
  }

  public updateFloorMaterial(hex: string, roughness?: number): void {
    this.townhouse.updateFloorMaterial(hex, roughness);
    if (this.houseManager.glbHouseScene) {
      this.houseManager.glbHouseScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const lowerName = mesh.name.toLowerCase();
          if ((lowerName.includes('foundation') || lowerName.includes('ceramic') || lowerName.includes('floor')) && mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              if ((m as THREE.MeshStandardMaterial).color) {
                (m as THREE.MeshStandardMaterial).color.set(hex);
                if (roughness !== undefined) (m as THREE.MeshStandardMaterial).roughness = roughness;
                m.needsUpdate = true;
              }
            });
          }
        }
      });
    }
  }

  public updateWallColor(hex: string): void {
    this.townhouse.updateWallColor(hex);
  }

  public dispose(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);

    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    this.cameraController.dispose();
    this.videoScroller.dispose();
    this.lighting.dispose();
    this.townhouse.dispose();
    this.hotspots.dispose();
    this.furniture.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
