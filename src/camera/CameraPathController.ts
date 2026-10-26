import * as THREE from 'three';
import { HouseNavigationConfig } from '../config/houseNavigationConfig';

export class CameraPathController {
  public config: HouseNavigationConfig;
  public cameraCurve: THREE.CatmullRomCurve3;
  public targetCurve: THREE.CatmullRomCurve3;

  private tempCamPos: THREE.Vector3 = new THREE.Vector3();
  private tempLookTarget: THREE.Vector3 = new THREE.Vector3();

  constructor(config: HouseNavigationConfig) {
    this.config = config;

    const camPoints = config.pathWaypoints.map(
      (wp) => new THREE.Vector3(wp.position[0], wp.position[1], wp.position[2])
    );

    const targetPoints = config.pathWaypoints.map(
      (wp) => new THREE.Vector3(wp.target[0], wp.target[1], wp.target[2])
    );

    // Using 'centripetal' curveType for Catmull-Rom avoids loops/overshoots around tight corners
    this.cameraCurve = new THREE.CatmullRomCurve3(camPoints, false, 'centripetal', 0.5);
    this.targetCurve = new THREE.CatmullRomCurve3(targetPoints, false, 'centripetal', 0.5);
  }

  /**
   * Reconfigures waypoints for a different house dynamically.
   */
  public updateConfig(config: HouseNavigationConfig): void {
    this.config = config;
    const camPoints = config.pathWaypoints.map(
      (wp) => new THREE.Vector3(wp.position[0], wp.position[1], wp.position[2])
    );
    const targetPoints = config.pathWaypoints.map(
      (wp) => new THREE.Vector3(wp.target[0], wp.target[1], wp.target[2])
    );
    this.cameraCurve = new THREE.CatmullRomCurve3(camPoints, false, 'centripetal', 0.5);
    this.targetCurve = new THREE.CatmullRomCurve3(targetPoints, false, 'centripetal', 0.5);
  }

  /**
   * Samples exact camera position and look target along the curve path.
   * progress t in [0.0, 1.0]
   */
  public getSample(t: number): { position: THREE.Vector3; target: THREE.Vector3 } {
    const clampedT = Math.max(0.0, Math.min(1.0, t));

    // getPoint gives exact interpolation along the 6 waypoints
    this.cameraCurve.getPoint(clampedT, this.tempCamPos);
    this.targetCurve.getPoint(clampedT, this.tempLookTarget);

    return {
      position: this.tempCamPos,
      target: this.tempLookTarget
    };
  }

  /**
   * Calculates the front door opening factor [0.0 = closed, 1.0 = open]
   * based on the current progress through the door opening window.
   */
  public getDoorFactor(progress: number): number {
    const start = this.config.doorOpenStartProgress;
    const end = this.config.doorOpenCompleteProgress;

    if (progress <= start) return 0.0;
    if (progress >= end) return 1.0;

    return (progress - start) / (end - start);
  }
}
