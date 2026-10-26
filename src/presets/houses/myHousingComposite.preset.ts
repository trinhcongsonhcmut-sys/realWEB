import { HousePreset } from '../../types/house.types';

export const MY_HOUSING_COMPOSITE_PRESET: HousePreset = {
  id: 'my-housing-composite',
  title: 'Căn Nhà Phố & Phòng Khách Wabi-Sabi',
  description: 'Mặt tiền nhà phố 3 tầng đi từ ngoài sân vào, cửa kính mở tự động ở giây 6.5 và bước vào phòng khách & bếp Wabi-Sabi cao cấp',
  type: 'composite',
  modelUrl: '/assets/houses/custom-room/livingroom_wabisabi_mix.glb',
  scale: 1.0,
  rotation: [0, Math.PI / 2, 0],
  offset: [0.0, 0.405, -3.20],
  floorHeight: 0.405,
  doorConfig: {
    meshName: 'FrontDoor',
    openAxis: 'y',
    openAngle: Math.PI * 0.45,
    startProgress: 0.52,
    completeProgress: 0.65
  },
  defaultCameraPathId: 'my-housing-walkthrough',
  availableCameraPathIds: ['my-housing-walkthrough', 'townhouse-main-entrance']
};
