import * as THREE from 'three';
import { Hotspot } from '../types';
import { EventEmitter } from './EventEmitter';

export class HotspotsManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public emitter: EventEmitter;

  public hotspotMeshes: { mesh: THREE.Group; data: Hotspot }[] = [];
  public visible: boolean = false;

  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private pulseTime: number = 0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, emitter: EventEmitter) {
    this.scene = scene;
    this.camera = camera;
    this.emitter = emitter;
  }

  public initHotspots(_hotspots: Hotspot[]): void {
    // Clear old hotspots
    this.hotspotMeshes.forEach((item) => this.scene.remove(item.mesh));
    this.hotspotMeshes = [];
    this.visible = false;
    // 3D visual beacon markers (white spheres with cyan rings) removed per user request
  }

  public setVisible(_visible: boolean): void {
    this.visible = false;
    this.hotspotMeshes.forEach((item) => {
      item.mesh.visible = false;
    });
  }

  public update(delta: number): void {
    if (!this.visible) return;

    this.pulseTime += delta * 3.0;
    const scale = 1.0 + Math.sin(this.pulseTime) * 0.15;
    const ringScale = 1.0 + (Math.sin(this.pulseTime * 1.5) + 1.0) * 0.25;

    this.hotspotMeshes.forEach((item) => {
      item.mesh.children[0].scale.set(ringScale, ringScale, ringScale);
      item.mesh.children[1].scale.set(scale, scale, scale);
    });
  }

  public handleClick(screenX: number, screenY: number, width: number, height: number): Hotspot | null {
    if (!this.visible) return null;

    this.mouse.x = (screenX / width) * 2 - 1;
    this.mouse.y = -(screenY / height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const clickables = this.hotspotMeshes.map((h) => h.mesh);
    const intersects = this.raycaster.intersectObjects(clickables, true);

    if (intersects.length > 0) {
      let top: THREE.Object3D | null = intersects[0].object;
      while (top && !top.userData.hotspot) {
        top = top.parent;
      }
      if (top && top.userData.hotspot) {
        const hs = top.userData.hotspot as Hotspot;
        this.emitter.emit('hotspot:selected', hs);
        return hs;
      }
    }
    return null;
  }

  public dispose(): void {
    this.hotspotMeshes.forEach((item) => this.scene.remove(item.mesh));
    this.hotspotMeshes = [];
  }
}
