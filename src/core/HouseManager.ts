import * as THREE from 'three';
import { HousePreset } from '../types/house.types';
import { TownhouseBuilder } from './TownhouseBuilder';
import { GlbModelLoader } from '../loaders/GlbModelLoader';
import { EventEmitter } from './EventEmitter';
import { TOWNHOUSE_PROCEDURAL_PRESET } from '../presets/houses/townhouseProcedural.preset';
import { MY_HOUSING_COMPOSITE_PRESET } from '../presets/houses/myHousingComposite.preset';

export class HouseManager {
  public scene: THREE.Scene;
  public emitter: EventEmitter;
  public currentPreset: HousePreset = MY_HOUSING_COMPOSITE_PRESET;

  // Active root group in the 3D scene
  public rootGroup: THREE.Group = new THREE.Group();

  // Procedural builder (active if type === 'procedural' or 'composite')
  public townhouseBuilder: TownhouseBuilder | null = null;

  // GLB loaded house scene (active if type === 'glb' or 'composite')
  public glbHouseScene: THREE.Group | null = null;
  private glbLoader: GlbModelLoader = new GlbModelLoader();

  // Animated door mesh reference
  public doorObject: THREE.Object3D | null = null;
  private doorInitialRotation: THREE.Euler = new THREE.Euler();

  constructor(scene: THREE.Scene, emitter: EventEmitter) {
    this.scene = scene;
    this.emitter = emitter;
    this.rootGroup.name = 'HouseManager_Root';
    this.scene.add(this.rootGroup);

    // Load initial default house (My Housing Composite: Facade + livingroom.glb)
    this.loadHouse(MY_HOUSING_COMPOSITE_PRESET);
  }

  public async loadHouse(preset: HousePreset): Promise<void> {
    this.currentPreset = preset;

    // Clear previous house objects
    while (this.rootGroup.children.length > 0) {
      this.rootGroup.remove(this.rootGroup.children[0]);
    }
    this.doorObject = null;

    if (preset.type === 'composite') {
      if (!this.townhouseBuilder) {
        this.townhouseBuilder = new TownhouseBuilder();
      }
      this.rootGroup.add(this.townhouseBuilder.rootGroup);

      if (preset.modelUrl) {
        try {
          console.log(`[HouseManager] Loading composite GLB room from ${preset.modelUrl}...`);
          const result = await this.glbLoader.loadModel(preset.modelUrl);
          this.glbHouseScene = result.scene;

          const scale = preset.scale ?? 1.0;
          this.glbHouseScene.scale.setScalar(scale);

          if (preset.rotation) {
            this.glbHouseScene.rotation.set(preset.rotation[0], preset.rotation[1], preset.rotation[2]);
          }

          // Calculate bounds to sit flat on floor at floorHeight
          this.glbHouseScene.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(this.glbHouseScene);
          const minY = box.min.y;
          const floorY = preset.floorHeight || 0.405;
          const offsetY = floorY - minY;

          const offset = preset.offset || [0.0, 0.405, 0.0];
          this.glbHouseScene.position.set(offset[0], offsetY, offset[2]);

          // Enable shadow & enhance materials & tag ceiling meshes for Dollhouse
          this.glbHouseScene.traverse((child) => {
            const lowerName = child.name.toLowerCase();
            // Hide balcony meshes that would block the front entrance
            if (lowerName.includes('bancong') || lowerName.includes('ceramics2')) {
              child.visible = false;
              return;
            }

            if (lowerName.includes('celling') || lowerName.includes('ceiling')) {
              child.userData.isCeiling = true;
            }
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              mesh.userData.isRoomFurniture = true;
              if (lowerName.includes('celling') || lowerName.includes('ceiling')) {
                mesh.userData.isCeiling = true;
              }
              if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                  mesh.material = mesh.material.map((m) => {
                    const cloned = m.clone();
                    cloned.side = THREE.DoubleSide;
                    return cloned;
                  });
                } else {
                  mesh.material = mesh.material.clone();
                  mesh.material.side = THREE.DoubleSide;
                }
                mesh.userData.hasUniqueMaterial = true;
              }
            }
          });

          // Add warm interior spotlights inside living room and kitchen
          const livingLight = new THREE.PointLight(0xffecd2, 2.6, 10.0);
          livingLight.position.set(0.0, 2.4, -1.2);
          livingLight.castShadow = true;
          this.rootGroup.add(livingLight);

          const kitchenLight = new THREE.PointLight(0xfff0db, 2.2, 10.0);
          kitchenLight.position.set(4.5, 2.4, -7.0);
          kitchenLight.castShadow = false;
          this.rootGroup.add(kitchenLight);

          const roomAmbient = new THREE.AmbientLight(0xfff5ea, 0.9);
          this.rootGroup.add(roomAmbient);

          this.townhouseBuilder.mountCustomRoom(this.glbHouseScene);
          this.emitter.emit('room:custom-mounted', this.glbHouseScene);
          console.log(`[HouseManager] Successfully mounted composite room: ${preset.title}`);
        } catch (err: any) {
          console.error('[HouseManager] Failed to load composite room:', err);
        }
      }
    } else if (preset.type === 'procedural') {
      if (!this.townhouseBuilder) {
        this.townhouseBuilder = new TownhouseBuilder();
      }
      this.rootGroup.add(this.townhouseBuilder.rootGroup);
      this.townhouseBuilder.setLivingFurnitureVisibility(true);
      console.log(`[HouseManager] Loaded procedural house: ${preset.title}`);
    } else if (preset.type === 'glb' && preset.modelUrl) {
      try {
        console.log(`[HouseManager] Loading GLB house from ${preset.modelUrl}...`);
        const result = await this.glbLoader.loadModel(preset.modelUrl);
        this.glbHouseScene = result.scene;

        if (preset.scale) {
          this.glbHouseScene.scale.setScalar(preset.scale);
        }
        if (preset.offset) {
          this.glbHouseScene.position.set(preset.offset[0], preset.offset[1], preset.offset[2]);
        }

        // Find door mesh if configured
        if (preset.doorConfig?.meshName) {
          this.glbHouseScene.traverse((child) => {
            if (child.name.toLowerCase().includes(preset.doorConfig!.meshName.toLowerCase())) {
              this.doorObject = child;
              this.doorInitialRotation.copy(child.rotation);
            }
          });
        }

        this.rootGroup.add(this.glbHouseScene);
        console.log(`[HouseManager] Successfully loaded GLB house: ${preset.title}`);
      } catch (err) {
        console.error(`[HouseManager] Failed to load GLB house: ${preset.title}`, err);
        // Fallback to procedural townhouse
        if (!this.townhouseBuilder) {
          this.townhouseBuilder = new TownhouseBuilder();
        }
        this.rootGroup.add(this.townhouseBuilder.rootGroup);
      }
    }

    this.emitter.emit('house:preset-changed', preset);
  }

  public setDoorOpenProgress(progress: number): void {
    if (this.currentPreset.type === 'procedural' && this.townhouseBuilder) {
      this.townhouseBuilder.setDoorOpenProgress(progress);
    } else if (this.doorObject && this.currentPreset.doorConfig) {
      const cfg = this.currentPreset.doorConfig;
      const angle = cfg.openAngle * progress;
      const axis = cfg.openAxis || 'y';
      if (axis === 'y') {
        this.doorObject.rotation.y = this.doorInitialRotation.y + angle;
      } else if (axis === 'z') {
        this.doorObject.rotation.z = this.doorInitialRotation.z + angle;
      }
    }
  }

  public setRoofVisibility(visible: boolean): void {
    if (this.townhouseBuilder) {
      this.townhouseBuilder.setRoofVisibility(visible);
    }
  }

  public setLivingFurnitureVisibility(visible: boolean): void {
    if (this.townhouseBuilder && this.currentPreset.type === 'procedural') {
      this.townhouseBuilder.setLivingFurnitureVisibility(visible);
    }
  }

  public getFloorHeight(): number {
    return this.currentPreset.floorHeight;
  }
}
