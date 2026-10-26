export type CameraState = 
  | 'EXTERIOR_ORBIT'
  | 'APPROACH_FACADE'
  | 'FRONT_DOOR_FOCUS'
  | 'PORTAL_TRANSITION'
  | 'INTERIOR_EXPLORATION'
  | 'DOLLHOUSE_VIEW'
  | 'FLOORPLAN_VIEW';

export type ViewMode = 'exterior' | 'interior' | 'dollhouse' | 'floorplan';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface CameraWaypoint {
  position: [number, number, number];
  target: [number, number, number];
}

export interface Hotspot {
  id: string;
  name: string;
  roomType: 'living' | 'kitchen' | 'bedroom' | 'balcony' | 'overview';
  position: [number, number, number];
  cameraView: CameraWaypoint;
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
  cameraWaypoints: {
    exterior: CameraWaypoint;
    approachFacade: CameraWaypoint;
    frontDoor: CameraWaypoint;
    interiorEntrance: CameraWaypoint;
    dollhouse: CameraWaypoint;
    floorplan: CameraWaypoint;
  };
  hotspots: Hotspot[];
  customizableMaterials: {
    sofaFabric: MaterialOption[];
    flooring: MaterialOption[];
    wallColor: MaterialOption[];
  };
}

export type CameraWalkState =
  | 'EXTERIOR'
  | 'APPROACHING_DOOR'
  | 'ENTERING_HOUSE'
  | 'INTERIOR_ARRIVAL'
  | 'INTERIOR_LOOK_AROUND'
  | 'RETURNING_OUTSIDE';

export interface AppEvents {
  'camera:state-changed': (state: CameraState) => void;
  'camera:walk-state-changed': (state: CameraWalkState) => void;
  'camera:scroll-progress': (progress: number) => void;
  'camera:prompt-exit': () => void;
  'view:mode-changed': (mode: ViewMode) => void;
  'hotspot:selected': (hotspot: Hotspot) => void;
  'material:changed': (category: string, optionId: string) => void;
  'auth:open': () => void;
  'auth:close': () => void;
  'auth:login-success': (user: { name: string; email: string }) => void;
  'property:loaded': (metadata: PropertyMetadata) => void;
}

// Modular Architecture Extensions
export * from './house.types';
export * from './camera.types';
export * from './furniture.types';
export * from './material.types';

