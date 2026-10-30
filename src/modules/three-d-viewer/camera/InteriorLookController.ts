import * as THREE from 'three';
import { CameraPathPreset } from '../schemas/3d.types';

export class InteriorLookController {
  private camera: THREE.PerspectiveCamera;
  private preset: CameraPathPreset;

  public isEnabled: boolean = false;
  private stationPoint: THREE.Vector3 = new THREE.Vector3();
  private yaw: number = 0;
  private pitch: number = 0;

  private targetYaw: number = 0;
  private targetPitch: number = 0;

  private isDragging: boolean = false;
  private previousPointerX: number = 0;
  private previousPointerY: number = 0;

  constructor(camera: THREE.PerspectiveCamera, preset: CameraPathPreset) {
    this.camera = camera;
    this.preset = preset;
    const cfg = preset.interior360;
    this.stationPoint.set(cfg.stationPoint[0], cfg.stationPoint[1], cfg.stationPoint[2]);
  }

  public activate(initialDirection: THREE.Vector3, station?: THREE.Vector3): void {
    this.isEnabled = true;
    if (station) {
      this.stationPoint.copy(station);
    } else {
      const cfg = this.preset.interior360;
      this.stationPoint.set(cfg.stationPoint[0], cfg.stationPoint[1], cfg.stationPoint[2]);
    }
    this.camera.position.copy(this.stationPoint);

    this.pitch = Math.asin(Math.max(-1, Math.min(1, initialDirection.y)));
    this.yaw = Math.atan2(-initialDirection.x, -initialDirection.z);
    this.targetYaw = this.yaw;
    this.targetPitch = this.pitch;
    this.updateCameraRotation();
  }

  public deactivate(): void {
    this.isEnabled = false;
    this.isDragging = false;
  }

  public onPointerDown(clientX: number, clientY: number): void {
    if (!this.isEnabled) return;
    this.isDragging = true;
    this.previousPointerX = clientX;
    this.previousPointerY = clientY;
  }

  public onPointerMove(clientX: number, clientY: number): void {
    if (!this.isEnabled || !this.isDragging) return;
    const deltaX = clientX - this.previousPointerX;
    const deltaY = clientY - this.previousPointerY;
    this.previousPointerX = clientX;
    this.previousPointerY = clientY;

    const sens = this.preset.interior360.lookSensitivity ?? 0.0035;
    this.targetYaw += deltaX * sens;
    this.targetPitch += deltaY * sens;

    const maxPitch = this.preset.interior360.maxPitch ?? Math.PI * 0.42;
    const minPitch = this.preset.interior360.minPitch ?? -Math.PI * 0.35;
    this.targetPitch = Math.max(minPitch, Math.min(maxPitch, this.targetPitch));
  }

  public onPointerUp(): void {
    this.isDragging = false;
  }

  public update(delta: number): void {
    if (!this.isEnabled) return;
    const damping = this.preset.interior360.dampingFactor ?? 22.0;
    const factor = 1.0 - Math.exp(-damping * Math.min(delta, 0.1));

    this.yaw += (this.targetYaw - this.yaw) * factor;
    this.pitch += (this.targetPitch - this.pitch) * factor;

    this.updateCameraRotation();
  }

  private updateCameraRotation(): void {
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
    this.camera.position.copy(this.stationPoint);
  }
}

