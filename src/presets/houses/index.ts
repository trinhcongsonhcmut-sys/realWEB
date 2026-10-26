import { HousePreset } from '../../types/house.types';
import { MY_HOUSING_COMPOSITE_PRESET } from './myHousingComposite.preset';
import { TOWNHOUSE_PROCEDURAL_PRESET } from './townhouseProcedural.preset';

export const HOUSES_REGISTRY: Record<string, HousePreset> = {
  [MY_HOUSING_COMPOSITE_PRESET.id]: MY_HOUSING_COMPOSITE_PRESET,
  [TOWNHOUSE_PROCEDURAL_PRESET.id]: TOWNHOUSE_PROCEDURAL_PRESET
};

export function getHousePreset(id: string): HousePreset {
  return HOUSES_REGISTRY[id] || MY_HOUSING_COMPOSITE_PRESET;
}

export * from './myHousingComposite.preset';
export * from './townhouseProcedural.preset';

