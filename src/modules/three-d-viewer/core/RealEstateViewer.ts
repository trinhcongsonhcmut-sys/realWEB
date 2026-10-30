import * as THREE from 'three';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { GlbModelLoader } from './GlbModelLoader';
import { HotspotsManager } from './HotspotsManager';
import { CameraStateMachine } from '../camera/CameraStateMachine';
import { HousePreset, CameraPathPreset, Hotspot } from '../schemas/3d.types';
import { MY_HOUSING_COMPOSITE_PRESET, MY_HOUSING_WALKTHROUGH_PATH } from '../presets/default3DPresets';

export class RealEstateViewer {
  public container: HTMLElement;
  public emitter: EventEmitter;

  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  public loader: GlbModelLoader;
  public hotspotsManager: HotspotsManager;
  public cameraStateMachine: CameraStateMachine;

  private currentModel?: THREE.Group;
  private animFrameId: number = 0;
  private lastTime: number = 0;
  private isDisposed: boolean = false;

  constructor(
    container: HTMLElement,
    emitter: EventEmitter,
    housePreset: HousePreset = MY_HOUSING_COMPOSITE_PRESET,
    pathPreset: CameraPathPreset = MY_HOUSING_WALKTHROUGH_PATH
  ) {
    this.container = container;
    this.emitter = emitter;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c10);

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // 4. Subsystems
    this.loader = new GlbModelLoader();
    this.hotspotsManager = new HotspotsManager(this.scene, this.camera, this.emitter);
    this.cameraStateMachine = new CameraStateMachine(this.camera, this.renderer.domElement, this.emitter, pathPreset);

    this.setupLighting();
    this.bindEvents();
    this.startLoop();

    if (housePreset.modelUrl) {
      this.loadHouse(housePreset.modelUrl);
    }
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    dirLight.position.set(15, 25, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xd9e8ff, 0.6);
    fillLight.position.set(-15, 10, -10);
    this.scene.add(fillLight);
  }

  public async loadHouse(modelUrl: string): Promise<void> {
    try {
      if (this.currentModel) {
        this.scene.remove(this.currentModel);
      }
      const result = await this.loader.loadModel(modelUrl);
      this.currentModel = result.scene;
      this.scene.add(this.currentModel);
      this.emitter.emit('viewer:model-loaded', modelUrl);
    } catch (err) {
      console.warn('Could not load 3D model, proceeding with virtual walkthrough:', err);
    }
  }

  public initHotspots(hotspots: Hotspot[]): void {
    this.hotspotsManager.initHotspots(hotspots);
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('click', (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.hotspotsManager.handleClick(x, y, rect.width, rect.height);
    });
  }

  private onResize = (): void => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / (height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private startLoop(): void {
    this.lastTime = performance.now();
    const animate = (time: number) => {
      if (this.isDisposed) return;
      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;

      this.cameraStateMachine.update(delta);
      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(animate);
    };
    this.animFrameId = requestAnimationFrame(animate);
  }

  public dispose(): void {
    this.isDisposed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.cameraStateMachine.dispose();
    this.hotspotsManager.dispose();
    this.loader.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

