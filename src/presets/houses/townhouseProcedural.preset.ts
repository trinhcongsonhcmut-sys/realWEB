import { HousePreset } from '../../types/house.types';

export const TOWNHOUSE_PROCEDURAL_PRESET: HousePreset = {
  id: 'house-vn-the-green-horizon-01',
  title: 'Nhà Phố 3 Tầng The Green Horizon',
  description: 'Mẫu nhà phố hiện đại 3 tầng với mặt tiền lam gỗ, ban công kính và phòng khách rộng rãi',
  type: 'procedural',
  floorHeight: 0.405,
  doorConfig: {
    meshName: 'FrontDoor',
    openAxis: 'y',
    openAngle: Math.PI * 0.42,
    startProgress: 0.18,
    completeProgress: 0.45
  },
  defaultCameraPathId: 'townhouse-main-entrance',
  availableCameraPathIds: ['townhouse-main-entrance']
};
