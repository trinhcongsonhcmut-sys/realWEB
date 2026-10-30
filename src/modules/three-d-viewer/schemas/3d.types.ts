export type CameraState =
  | 'EXTERIOR_ORBIT'
  | 'APPROACH_FACADE'
  | 'FRONT_DOOR_FOCUS'
  | 'PORTAL_TRANSITION'
  | 'INTERIOR_EXPLORATION'
  | 'DOLLHOUSE_VIEW'
  | 'FLOORPLAN_VIEW';

export type CameraWalkState =
  | 'EXTERIOR'
  | 'APPROACHING_DOOR'
  | 'ENTERING_HOUSE'
  | 'INTERIOR_ARRIVAL'
  | 'INTERIOR_LOOK_AROUND'
  | 'RETURNING_OUTSIDE';

export type ViewMode = 'exterior' | 'interior' | 'dollhouse' | 'floorplan';

export interface CameraWaypointConfig {
  position: [number, number, number];
  target: [number, number, number];
  description?: string;
}

export interface CameraPathPreset {
  id: string;
  name: string;
  houseId: string;
  description?: string;
  waypoints: CameraWaypointConfig[];
  scrollSensitivity?: number;
  progressDamping?: number;
  doorOpenStartProgress?: number;
  doorOpenCompleteProgress?: number;
  interior360: {
    stationPoint: [number, number, number];
    initialTarget: [number, number, number];
    maxPitch?: number;
    minPitch?: number;
    lookSensitivity?: number;
    dampingFactor?: number;
  };
}

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

export interface Hotspot {
  id: string;
  name: string;
  roomType: 'living' | 'kitchen' | 'bedroom' | 'balcony' | 'overview';
  position: [number, number, number];
  cameraView: {
    position: [number, number, number];
    target: [number, number, number];
  };
  description: string;
  floor: number;
}

export interface MaterialOption {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness?: number;
  previewUrl?: string;
}

export interface PropertyMetadata {
  propertyId: string;
  title: string;
  tagline: string;
  type: string;
  address: string;
  price: {
    value: number;
    currency: string;
    display: string;
  };
  specifications: {
    landArea: string;
    usableArea: string;
    floors: number;
    bedrooms: number;
    bathrooms: number;
    direction: string;
    status: string;
    completionYear: number;
  };
  features: string[];
  hotspots: Hotspot[];
  customizableMaterials?: {
    sofaFabric?: MaterialOption[];
    flooring?: MaterialOption[];
    wallColor?: MaterialOption[];
  };
}

