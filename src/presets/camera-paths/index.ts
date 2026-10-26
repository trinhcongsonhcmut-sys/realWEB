import { CameraPathPreset } from '../../types/camera.types';
import { TOWNHOUSE_MAIN_ENTRANCE_PATH } from './townhouseMainEntrance.preset';
import { MY_HOUSING_WALKTHROUGH_PATH } from './myHousingWalkthrough.preset';

export const CAMERA_PATHS_REGISTRY: Record<string, CameraPathPreset> = {
  [MY_HOUSING_WALKTHROUGH_PATH.id]: MY_HOUSING_WALKTHROUGH_PATH,
  [TOWNHOUSE_MAIN_ENTRANCE_PATH.id]: TOWNHOUSE_MAIN_ENTRANCE_PATH
};

export function getCameraPathPreset(id: string): CameraPathPreset {
  return CAMERA_PATHS_REGISTRY[id] || MY_HOUSING_WALKTHROUGH_PATH;
}

export * from './townhouseMainEntrance.preset';
export * from './myHousingWalkthrough.preset';

