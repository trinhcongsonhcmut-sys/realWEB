import { CameraPathPreset } from '../../types/camera.types';

export const MY_HOUSING_WALKTHROUGH_PATH: CameraPathPreset = {
  id: 'my-housing-walkthrough',
  name: 'Hành Trình Video My-Housing (Flycam & Ngoại Thất)',
  houseId: 'my-housing-composite',
  description: 'Quỹ đạo mượt mà từ flycam góc xa khu phố (3 cấp lăn nhanh), tiếp nối chính diện mặt tiền, qua cổng sắt, trước thềm tam cấp và bước vào phòng khách 3D',

  waypoints: [
    // Mốc 1 (Cấp 1 - Video 1 bắt đầu): Toàn cảnh hè phố trên cao từ góc chéo flycam
    {
      position: [-10.0, 8.5, 20.0],
      target: [0.0, 3.4, 0.5],
      description: 'Cấp 1: Toàn cảnh flycam góc xa hè phố'
    },
    // Mốc 2 (Cấp 2 - Video 1 giữa): Flycam lướt xoay góc phố tiếp cận ngôi nhà
    {
      position: [-4.5, 7.6, 17.5],
      target: [0.0, 3.4, 0.5],
      description: 'Cấp 2: Lướt xoay góc phố tiếp cận nhà'
    },
    // Mốc 3 (Cấp 3 - Video 1 kết thúc / Video 2 bắt đầu): Chính diện mặt tiền trên cao (khớp frame 0 của my-housing.mp4)
    {
      position: [0.0, 6.8, 15.2],
      target: [0.0, 3.4, 0.5],
      description: 'Cấp 3: Chính diện mặt tiền ngôi nhà trên cao'
    },
    // Mốc 4 (Cấp 4): Hạ thấp lướt qua cổng sắt vào sân gạch tiền sảnh & vườn zen
    {
      position: [0.0, 2.5, 6.5],
      target: [0.0, 1.85, 1.2],
      description: 'Cấp 4: Bay qua cổng sắt vào sân tiền sảnh'
    },
    // Mốc 5 (Cấp 5): Dừng trước thềm tam cấp đá đen kim sa, nhìn xuyên qua kính cửa thấy phòng khách
    {
      position: [0.0, 1.70, 2.6],
      target: [0.0, 1.65, -1.8],
      description: 'Cấp 5: Trước bậc tam cấp, nhìn xuyên qua kính thấy phòng khách'
    },
    // Mốc 6 (Cấp 6): Cửa kính 4 cánh tự mở rộng sang 2 bên, chuyển cảnh bước qua ngưỡng cửa
    {
      position: [0.0, 1.60, 0.8],
      target: [0.5, 1.50, -2.5],
      description: 'Cấp 6: Cửa mở ra, chuyển cảnh bước vào phòng khách 3D'
    },
    // Mốc 7 (Cấp 7): Dừng chân tại tâm phòng khách Wabi-Sabi, mở khóa xoay 360 độ và chọn đồ nội thất
    {
      position: [0.0, 1.50, -0.6],
      target: [0.75, 1.45, -2.0],
      description: 'Cấp 7: Giữa phòng khách Wabi-Sabi, dừng chân & xoay 360 độ'
    }
  ],

  // Cửa chính bắt đầu mở tại tiến trình 0.65 và mở hoàn toàn tại 0.75
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
