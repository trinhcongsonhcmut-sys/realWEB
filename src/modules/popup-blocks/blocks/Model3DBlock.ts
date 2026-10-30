import * as THREE from 'three';
import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { GlbModelLoader } from '../../three-d-viewer/core/GlbModelLoader';
import { DomUtils } from '../../shared/utils/domUtils';

export interface Model3DBlockContent {
  modelUrl: string;
  autoRotate?: boolean;
  scale?: number;
  label?: string;
}

export class Model3DBlock extends BaseBlock<Model3DBlockContent> {
  private loader?: GlbModelLoader;
  private renderer?: THREE.WebGLRenderer;
  private animId?: number;

  constructor(schema: PopupBlockSchema<Model3DBlockContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', 'block-popup block-model3d');
    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'Mô Hình Nội Thất 3D'}</span>
        <span class="popup-badge">3D Object</span>
      </div>
      <div class="popup-content-body">
        <div class="model3d-canvas-wrap" id="wrap-${this.schema.id}"></div>
        <div class="popup-caption">${this.schema.content.label || 'Kéo chuột để xoay quan sát vật thể 360 độ'}</div>
      </div>
    `;

    setTimeout(() => {
      const wrap = card.querySelector(`#wrap-${this.schema.id}`) as HTMLElement;
      if (wrap) this.initScene(wrap);
    }, 50);

    return card;
  }

  private initScene(wrap: HTMLElement): void {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131720);

    const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / (wrap.clientHeight || 1), 0.1, 100);
    camera.position.set(2, 1.5, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(wrap.clientWidth, wrap.clientHeight || 240);
    wrap.appendChild(renderer.domElement);
    this.renderer = renderer;

    const light = new THREE.DirectionalLight(0xffffff, 2.0);
    light.position.set(5, 10, 7);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    this.loader = new GlbModelLoader();
    let modelGroup: THREE.Group | undefined;

    if (this.schema.content.modelUrl) {
      this.loader.loadModel(this.schema.content.modelUrl).then((res) => {
        modelGroup = res.scene;
        scene.add(modelGroup);
      }).catch(() => {
        // Fallback procedural geometry
        const geo = new THREE.TorusKnotGeometry(0.7, 0.25, 64, 16);
        const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8 });
        modelGroup = new THREE.Group();
        modelGroup.add(new THREE.Mesh(geo, mat));
        scene.add(modelGroup);
      });
    }

    const animate = () => {
      if (modelGroup && this.schema.content.autoRotate !== false) {
        modelGroup.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
      this.animId = requestAnimationFrame(animate);
    };
    this.animId = requestAnimationFrame(animate);
  }

  public dispose(): void {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.loader?.dispose();
    this.renderer?.dispose();
    super.dispose();
  }
}

