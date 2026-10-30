import * as THREE from 'three';
import { CameraPathPreset } from '../schemas/3d.types';

export class CameraPathController {
  public preset: CameraPathPreset;
  public cameraCurve: THREE.CatmullRomCurve3;
  public targetCurve: THREE.CatmullRomCurve3;

  private tempCamPos: THREE.Vector3 = new THREE.Vector3();
  private tempLookTarget: THREE.Vector3 = new THREE.Vector3();

  constructor(preset: CameraPathPreset) {
    this.preset = preset;

    const camPoints = preset.waypoints.map(
      (wp) => new THREE.Vector3(wp.position[0], wp.position[1], wp.position[2])
    );
    const targetPoints = preset.waypoints.map(
      (wp) => new THREE.Vector3(wp.target[0], wp.target[1], wp.target[2])
    );

    this.cameraCurve = new THREE.CatmullRomCurve3(camPoints, false, 'centripetal', 0.5);
    this.targetCurve = new THREE.CatmullRomCurve3(targetPoints, false, 'centripetal', 0.5);
  }

  public updatePreset(preset: CameraPathPreset): void {
    this.preset = preset;
    const camPoints = preset.waypoints.map(
      (wp) => new THREE.Vector3(wp.position[0], wp.position[1], wp.position[2])
    );
    const targetPoints = preset.waypoints.map(
      (wp) => new THREE.Vector3(wp.target[0], wp.target[1], wp.target[2])
    );
    this.cameraCurve = new THREE.CatmullRomCurve3(camPoints, false, 'centripetal', 0.5);
    this.targetCurve = new THREE.CatmullRomCurve3(targetPoints, false, 'centripetal', 0.5);
  }

  public getSample(t: number): { position: THREE.Vector3; target: THREE.Vector3 } {
    const clampedT = Math.max(0.0, Math.min(1.0, t));
    this.cameraCurve.getPoint(clampedT, this.tempCamPos);
    this.targetCurve.getPoint(clampedT, this.tempLookTarget);

    return {
      position: this.tempCamPos,
      target: this.tempLookTarget
    };
  }

  public getDoorFactor(progress: number): number {
    const start = this.preset.doorOpenStartProgress ?? 0.65;
    const end = this.preset.doorOpenCompleteProgress ?? 0.75;

    if (progress <= start) return 0.0;
    if (progress >= end) return 1.0;
    return (progress - start) / (end - start);
  }
}

