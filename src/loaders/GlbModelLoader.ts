import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface ModelLoadResult {
  scene: THREE.Group;
  boundingBox: THREE.Box3;
  size: THREE.Vector3;
  center: THREE.Vector3;
  animations: THREE.AnimationClip[];
}

export class GlbModelLoader {
  private loader: GLTFLoader;
  private dracoLoader: DRACOLoader;

  constructor() {
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.loader.setDRACOLoader(this.dracoLoader);
  }

  public async loadModel(
    url: string,
    onProgress?: (event: ProgressEvent) => void
  ): Promise<ModelLoadResult> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;

          // Enable shadows and optimize materials
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach((mat) => {
                    mat.side = THREE.DoubleSide;
                  });
                } else {
                  mesh.material.side = THREE.DoubleSide;
                }
              }
            }
          });

          // Calculate model bounding box and center
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          resolve({
            scene: model,
            boundingBox: box,
            size,
            center,
            animations: gltf.animations || []
          });
        },
        onProgress,
        (error) => {
          console.error(`Failed to load GLB model from ${url}:`, error);
          reject(error);
        }
      );
    });
  }

  public dispose(): void {
    this.dracoLoader.dispose();
  }
}
