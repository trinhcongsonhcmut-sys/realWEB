import { CameraPathPreset } from '../../types/camera.types';

export const TOWNHOUSE_MAIN_ENTRANCE_PATH: CameraPathPreset = {
  id: 'townhouse-main-entrance',
  name: 'Lối Đi Cửa Chính (5 Cấp Độ)',
  houseId: 'house-vn-the-green-horizon-01',
  description: 'Hành trình từ vỉa hè ngoại thất, tiếp cận cổng, bước qua cửa chính và dừng chân tại phòng khách',
  
  waypoints: [
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

  doorOpenStartProgress: 0.18,
  doorOpenCompleteProgress: 0.45,
  scrollSensitivity: 0.00025,
  progressDamping: 5.2,

  interior360: {
    stationPoint: [0.0, 1.60, -3.2],
    initialTarget: [0.0, 1.50, -5.2],
    maxPitch: Math.PI * 0.42,
    minPitch: -Math.PI * 0.35,
    lookSensitivity: 0.0035,
    dampingFactor: 22.0
  }
};
