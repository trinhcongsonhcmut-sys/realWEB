import { CameraPathPreset } from '../../types/camera.types';

export const MY_HOUSING_WALKTHROUGH_PATH: CameraPathPreset = {
  id: 'my-housing-walkthrough',
  name: 'Hành Trình Video My-Housing (Cửa Mở Giây 6.5)',
  houseId: 'my-housing-composite',
  description: 'Quỹ đạo mượt mà từ trên cao hè phố qua cổng sắt, tiếp cận cửa kính nhìn xuyên vào trong, cửa tự mở ở giây 6.5 và bước vào phòng khách 3D',

  waypoints: [
    // Mốc 1 (00:00 - 00:02): Toàn cảnh hè phố trên cao nhìn bao quát ngôi nhà 3 tầng (khớp frame 0s của my-housing.mp4)
    {
      position: [0.0, 6.8, 15.2],
      target: [0.0, 3.4, 0.5],
      description: 'Giây 0-2: Toàn cảnh mặt tiền ngôi nhà trên cao'
    },
    // Mốc 2 (00:02 - 00:04): Hạ thấp lướt qua cổng sắt vào sân gạch tiền sảnh & vườn zen
    {
      position: [0.0, 2.5, 6.5],
      target: [0.0, 1.85, 1.2],
      description: 'Giây 2-4: Bay qua cổng sắt vào sân tiền sảnh'
    },
    // Mốc 3 (00:05 - 00:05.5): Dừng trước thềm tam cấp đá đen kim sa, nhìn xuyên qua kính cửa thấy phòng khách
    {
      position: [0.0, 1.70, 2.6],
      target: [0.0, 1.65, -1.8],
      description: 'Giây 5-5.5: Trước bậc tam cấp, nhìn xuyên qua kính thấy phòng khách'
    },
    // Mốc 4 (00:06.5): Cửa kính 4 cánh tự mở rộng sang 2 bên, chuyển cảnh bước qua ngưỡng cửa
    {
      position: [0.0, 1.60, 0.8],
      target: [0.5, 1.50, -2.5],
      description: 'Giây 6.5: Cửa mở ra, chuyển cảnh bước vào phòng khách 3D'
    },
    // Mốc 5 (00:08 - 00:09): Dừng chân tại tâm phòng khách Wabi-Sabi, mở khóa xoay 360 độ và chọn đồ nội thất
    {
      position: [0.0, 1.50, -0.6],
      target: [0.75, 1.45, -2.0],
      description: 'Giây 8-9: Giữa phòng khách Wabi-Sabi, dừng chân & xoay 360 độ'
    }
  ],

  // Cửa chính bắt đầu mở tại tiến trình 0.52 và mở hoàn toàn tại 0.65 (khớp giây thứ 6.5)
  doorOpenStartProgress: 0.52,
  doorOpenCompleteProgress: 0.65,

  scrollSensitivity: 0.00025,
  progressDamping: 5.2,

  interior360: {
    stationPoint: [0.0, 1.50, -0.6],
    initialTarget: [0.75, 1.45, -2.0],
    maxPitch: Math.PI * 0.42,
    minPitch: -Math.PI * 0.35,
    lookSensitivity: 0.0035,
    dampingFactor: 12.0
  }
};
