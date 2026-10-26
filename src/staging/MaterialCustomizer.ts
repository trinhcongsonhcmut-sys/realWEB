import * as THREE from 'three';
import { PBRMaterialPreset } from '../types/material.types';
import { PBR_MATERIALS_LIBRARY } from '../presets/materials/materialLibrary';

export class MaterialCustomizer {
  private materialCache: Map<string, THREE.Material> = new Map();

  public getOrCreateMaterial(preset: PBRMaterialPreset): THREE.Material {
    if (this.materialCache.has(preset.id)) {
      return this.materialCache.get(preset.id)!;
    }

    let mat: THREE.Material;

    if (preset.type === 'glass') {
      mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(preset.color),
        roughness: preset.roughness,
        metalness: preset.metalness || 0.0,
        transmission: preset.transmission || 0.9,
        ior: preset.ior || 1.5,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(preset.color),
        roughness: preset.roughness,
        metalness: preset.metalness || 0.0,
        side: THREE.DoubleSide
      });
    }

    this.materialCache.set(preset.id, mat);
    return mat;
  }

  public applyPresetToMesh(mesh: THREE.Mesh, presetId: string): boolean {
    const preset = PBR_MATERIALS_LIBRARY[presetId];
    if (!preset) {
      console.warn(`[MaterialCustomizer] Preset ${presetId} not found in library.`);
      return false;
    }

    mesh.material = this.getOrCreateMaterial(preset);
    mesh.material.needsUpdate = true;
    return true;
  }

  public applyPresetToGroup(group: THREE.Group, presetId: string, filterMeshName?: string): void {
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!filterMeshName || mesh.name.toLowerCase().includes(filterMeshName.toLowerCase())) {
          this.applyPresetToMesh(mesh, presetId);
        }
      }
    });
  }
}
