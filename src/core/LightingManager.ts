import * as THREE from 'three';
import { ViewMode } from '../types';

export class LightingManager {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;

  public sunLight!: THREE.DirectionalLight;
  public hemiLight!: THREE.HemisphereLight;
  public ambientLight!: THREE.AmbientLight;

  public interiorLights: THREE.PointLight[] = [];
  public interiorSpotLights: THREE.SpotLight[] = [];

  private targetExposure: number = 1.0;
  private currentExposure: number = 1.0;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.initLighting();
  }

  private initLighting(): void {
    // 1. Hemisphere Light (Soft Sky and Earth bounce)
    this.hemiLight = new THREE.HemisphereLight(0xddeeff, 0x334433, 0.65);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // 2. Ambient Light for baseline visibility
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    // 3. Directional Sun Light with high-quality soft shadows
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    this.sunLight.position.set(16, 26, 18);
    this.sunLight.castShadow = true;

    // Shadow map tuning
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 70;
    this.sunLight.shadow.bias = -0.0004;

    const d = 16;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;

    this.scene.add(this.sunLight);

    // 4. Interior Warm Lights (Living Room, Kitchen, Bedroom)
    // Living room ceiling recessed warm spot
    const livingLight = new THREE.PointLight(0xffe6b8, 2.2, 12, 1.8);
    livingLight.position.set(0, 2.9, -3.2);
    this.scene.add(livingLight);
    this.interiorLights.push(livingLight);

    // Living room designer floor lamp
    const lampLight = new THREE.PointLight(0xffd18a, 1.8, 6, 2.0);
    lampLight.position.set(-2.2, 1.8, -4.5);
    this.scene.add(lampLight);
    this.interiorLights.push(lampLight);

    // Kitchen island downlights
    const kitchenLight = new THREE.PointLight(0xfff3db, 2.0, 9, 1.8);
    kitchenLight.position.set(-1.8, 2.9, -6.8);
    this.scene.add(kitchenLight);
    this.interiorLights.push(kitchenLight);

    // Master Bedroom light (1st floor)
    const bedLight = new THREE.PointLight(0xffe8c7, 2.2, 12, 1.8);
    bedLight.position.set(0, 6.2, -3.5);
    this.scene.add(bedLight);
    this.interiorLights.push(bedLight);

    // Front porch welcoming light
    const porchLight = new THREE.PointLight(0xffdfa8, 1.5, 7, 1.8);
    porchLight.position.set(0.2, 2.8, 1.2);
    this.scene.add(porchLight);
    this.interiorLights.push(porchLight);
  }

  public setViewModeLighting(mode: ViewMode): void {
    if (mode === 'interior') {
      // Warm, intimate indoor ambiance
      this.targetExposure = 1.15;
      this.sunLight.intensity = 1.2;
      this.ambientLight.intensity = 0.55;
      this.interiorLights.forEach((l) => (l.intensity = 2.4));
    } else if (mode === 'dollhouse' || mode === 'floorplan') {
      // Clear, balanced architectural view
      this.targetExposure = 1.05;
      this.sunLight.intensity = 1.8;
      this.ambientLight.intensity = 0.8;
      this.interiorLights.forEach((l) => (l.intensity = 1.8));
    } else {
      // Sunny crisp exterior
      this.targetExposure = 0.95;
      this.sunLight.intensity = 2.2;
      this.ambientLight.intensity = 0.45;
      this.interiorLights.forEach((l) => (l.intensity = 1.6));
    }
  }

  public update(delta: number): void {
    // Smooth auto-exposure adaptation
    if (Math.abs(this.currentExposure - this.targetExposure) > 0.005) {
      this.currentExposure += (this.targetExposure - this.currentExposure) * Math.min(1.0, delta * 3.0);
      this.renderer.toneMappingExposure = this.currentExposure;
    }
  }

  public dispose(): void {
    this.scene.remove(this.sunLight);
    this.scene.remove(this.hemiLight);
    this.scene.remove(this.ambientLight);
    this.interiorLights.forEach((l) => this.scene.remove(l));
  }
}
