import * as THREE from 'three';
import { Hotspot } from '../schemas/3d.types';
import { EventEmitter } from '../../shared/events/EventEmitter';

export class HotspotsManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public emitter: EventEmitter;
  public hotspotMeshes: { mesh: THREE.Group; data: Hotspot }[] = [];
  public visible: boolean = false;

  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, emitter: EventEmitter) {
    this.scene = scene;
    this.camera = camera;
    this.emitter = emitter;
  }

  public initHotspots(hotspots: Hotspot[]): void {
    this.dispose();
    hotspots.forEach((hs) => {
      const group = new THREE.Group();
      group.position.set(hs.position[0], hs.position[1], hs.position[2]);

      // Simple indicator
      const geometry = new THREE.SphereGeometry(0.12, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const pin = new THREE.Mesh(geometry, material);
      pin.userData.hotspot = hs;
      group.add(pin);

      this.scene.add(group);
      this.hotspotMeshes.push({ mesh: group, data: hs });
    });
    this.visible = true;
  }

  public setVisible(val: boolean): void {
    this.visible = val;
    this.hotspotMeshes.forEach((item) => {
      item.mesh.visible = val;
    });
  }

  public handleClick(screenX: number, screenY: number, width: number, height: number): Hotspot | null {
    if (!this.visible || this.hotspotMeshes.length === 0) return null;

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

