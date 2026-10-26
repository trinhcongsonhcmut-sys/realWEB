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
