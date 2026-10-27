import * as THREE from 'three';

export interface CameraWaypointConfig {
  position: [number, number, number];
  target: [number, number, number];
  description?: string;
}

export interface HouseNavigationConfig {
  houseId: string;
  // 6 Sequential Waypoints for the fixed walkthrough path
  pathWaypoints: CameraWaypointConfig[];
  
  // Door animation timing relative to path progress [0..1]
  doorOpenStartProgress: number; // e.g. 0.58
  doorOpenCompleteProgress: number; // e.g. 0.78
  
  // Sensitivity and smoothing settings
  scrollSensitivity: number;
  progressDamping: number; // Factor per second

  // Interior 360 look limits
  interiorLook: {
    stationPoint: [number, number, number];
    initialTarget: [number, number, number];
    maxPitch: number; // Max up angle (radians)
    minPitch: number; // Max down angle (radians)
    lookSensitivity: number;
    dampingFactor: number;
  };
}

export const DEFAULT_TOWNHOUSE_NAV_CONFIG: HouseNavigationConfig = {
  houseId: 'house-vn-the-green-horizon-01',
  
  // 5 Cấp độ di chuyển vào nhà theo yêu cầu:
  // - 2 cấp đầu: Ngoại thất tiếp cận & Bước qua cửa chính vào tiền sảnh
  // - 3 cấp sau: Bước vào phòng ngủ, Tiến sâu đến giường Master, Dừng chân & Xoay 360°
  pathWaypoints: [
    // Cấp 1 (Ngoại thất): Toàn cảnh mặt tiền ngôi nhà 3 tầng trên hè phố
    {
      position: [0.2, 3.2, 13.8],
      target: [0.0, 4.8, 2.0],
      description: 'Cấp 1: Toàn cảnh ngoại thất mặt tiền'
    },
    // Cấp 2 (Tiếp cận cổng): Qua cổng sắt vào sân tiền sảnh trước cửa
    {
      position: [0.1, 1.85, 3.8],
      target: [0.0, 1.8, 1.4],
      description: 'Cấp 2: Tiếp cận cổng & sân trước'
    },
    // Cấp 3 (Vào phòng): Bước qua cửa chính vào đầu phòng khách - Xoay 360° tự do
    {
      position: [0.0, 1.62, 0.4],
      target: [0.0, 1.60, -4.0],
      description: 'Cấp 3: Bước vào phòng - Xoay 360° tự do'
    },
    // Cấp 4 (Giữa phòng): Khu vực sofa, bàn trà & chân cầu thang - Xoay 360° tự do
    {
      position: [0.0, 1.62, -2.8],
      target: [0.0, 1.60, -7.0],
      description: 'Cấp 4: Giữa phòng khách - Xoay 360° tự do'
    },
    // Cấp 5 (Cuối phòng): Khu vực bếp ăn & sau cầu thang - Xoay 360° tự do
    {
      position: [0.0, 1.62, -5.8],
      target: [0.0, 1.60, -10.0],
      description: 'Cấp 5: Cuối phòng bếp & cầu thang - Xoay 360° tự do'
    }
  ],

  // Cửa chính mở tại 0.65 và mở hoàn toàn tại 0.75 để bước vào phòng
  doorOpenStartProgress: 0.65,
  doorOpenCompleteProgress: 0.75,

  scrollSensitivity: 0.00025,
  progressDamping: 5.2,

  interiorLook: {
    stationPoint: [0.0, 1.50, -0.6],
    initialTarget: [0.75, 1.45, -2.0],
    maxPitch: Math.PI * 0.42, // ~75 degrees up
    minPitch: -Math.PI * 0.35, // ~63 degrees down
    lookSensitivity: 0.0035,
    dampingFactor: 12.0
  }
};
