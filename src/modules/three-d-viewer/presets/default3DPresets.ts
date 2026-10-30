import { CameraPathPreset, HousePreset, PropertyMetadata } from '../schemas/3d.types';

export const MY_HOUSING_WALKTHROUGH_PATH: CameraPathPreset = {
  id: 'my-housing-walkthrough',
  name: 'Hành Trình Video My-Housing (Flycam & Ngoại Thất)',
  houseId: 'my-housing-composite',
  description: 'Quỹ đạo mượt mà từ flycam góc xa khu phố, tiếp nối mặt tiền và bước vào phòng khách 3D',
  waypoints: [
    { position: [-10.0, 8.5, 20.0], target: [0.0, 3.4, 0.5], description: 'Cấp 1: Toàn cảnh flycam góc xa hè phố' },
    { position: [-4.5, 7.6, 17.5], target: [0.0, 3.4, 0.5], description: 'Cấp 2: Lướt xoay góc phố tiếp cận nhà' },
    { position: [0.0, 6.8, 15.2], target: [0.0, 3.4, 0.5], description: 'Cấp 3: Chính diện mặt tiền ngôi nhà trên cao' },
    { position: [0.0, 2.5, 6.5], target: [0.0, 1.85, 1.2], description: 'Cấp 4: Bay qua cổng sắt vào sân tiền sảnh' },
    { position: [0.0, 1.70, 2.6], target: [0.0, 1.65, -1.8], description: 'Cấp 5: Trước bậc tam cấp nhìn xuyên phòng khách' },
    { position: [0.0, 1.60, 0.8], target: [0.5, 1.50, -2.5], description: 'Cấp 6: Bước qua ngưỡng cửa vào phòng' },
    { position: [0.0, 1.50, -0.6], target: [0.75, 1.45, -2.0], description: 'Cấp 7: Tâm phòng khách Wabi-Sabi xoay 360 độ' }
  ],
  doorOpenStartProgress: 0.65,
  doorOpenCompleteProgress: 0.75,
  scrollSensitivity: 0.00025,
  progressDamping: 5.2,
  interior360: {
    stationPoint: [0.0, 1.50, -0.6],
    initialTarget: [0.75, 1.45, -2.0],
    maxPitch: Math.PI * 0.42,
    minPitch: -Math.PI * 0.35,
    lookSensitivity: 0.0035,
    dampingFactor: 22.0
  }
};

export const MY_HOUSING_COMPOSITE_PRESET: HousePreset = {
  id: 'my-housing-composite',
  title: 'Căn Nhà Phố & Phòng Khách Wabi-Sabi',
  description: 'Mặt tiền nhà phố 3 tầng đi từ ngoài sân vào, cửa kính mở tự động và bước vào phòng khách & bếp Wabi-Sabi cao cấp',
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
    startProgress: 0.65,
    completeProgress: 0.75
  },
  defaultCameraPathId: 'my-housing-walkthrough',
  availableCameraPathIds: ['my-housing-walkthrough']
};

export const SAMPLE_PROPERTY: PropertyMetadata = {
  propertyId: 'house-vn-the-green-horizon-01',
  title: 'Căn Nhà Phố Hiện Đại (My Housing)',
  tagline: 'Mặt tiền bo cong thời thượng, sân vườn tiểu cảnh và nội thất phòng khách cao cấp',
  type: 'Nhà Phố Hiện Đại 3 Tầng',
  address: 'Khu Đô Thị Mới, TP. Hồ Chí Minh',
  price: {
    value: 15500000000,
    currency: 'VND',
    display: '15.5 Tỷ VNĐ'
  },
  specifications: {
    landArea: '90 m² (4.5m x 20m)',
    usableArea: '260 m²',
    floors: 3,
    bedrooms: 4,
    bathrooms: 4,
    direction: 'Đông',
    status: 'Sẵn sàng bàn giao - Sổ hồng riêng',
    completionYear: 2026
  },
  features: [
    'Thiết kế thông tầng đón gió tự nhiên và ánh sáng ngập tràn',
    'Mặt tiền hiện đại ốp gỗ Conwood và ban công kính cường lực 12mm',
    'Phòng khách sang trọng liên thông bếp ăn phong cách mở',
    'Hạ tầng thông minh Smarthome tích hợp điều khiển từ xa'
  ],
  hotspots: [
    {
      id: 'hs-living',
      name: 'Phòng Khách Wabi-Sabi',
      roomType: 'living',
      position: [0.0, 1.0, -2.8],
      cameraView: {
        position: [0.0, 1.50, -0.6],
        target: [0.0, 1.40, -4.5]
      },
      description: 'Không gian phòng khách Wabi-Sabi cao cấp với sofa vải thô tự nhiên, bàn trà mộc nguyên khối.',
      floor: 1
    }
  ]
};

