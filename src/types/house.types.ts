export interface HouseDoorConfig {
  meshName: string;
  openAxis?: 'x' | 'y' | 'z';
  openAngle: number;
  startProgress: number;
  completeProgress: number;
}

export interface HousePreset {
  id: string;
  title: string;
  description?: string;
  type: 'procedural' | 'glb' | 'composite';
  modelUrl?: string;
  scale?: number;
  rotation?: [number, number, number];
  offset?: [number, number, number];
  floorHeight: number;
  doorConfig?: HouseDoorConfig;
  defaultCameraPathId: string;
  availableCameraPathIds: string[];
}
