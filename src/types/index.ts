/**
 * Types definition for Scroll-Driven Video Platform (Custom Multi-Stage Walkthrough)
 */

export type ScrollerDisplayMode = 'cover' | 'contain';
export type MotionMode = 'discrete_stages' | 'continuous';

export interface StageInfo {
  index: number; // 0..14
  stageNumber: number; // 1..15
  timeSec: number; // seconds
  progress: number; // 0.0000 -> 1.0000
  title: string;
  section: string;
  subtitle: string;
}

// Total video duration: ~9.933s (298 frames at 30 fps)
const TOTAL_DURATION = 9.933;

function toP(sec: number): number {
  return Math.min(1.0, Math.max(0.0, +(sec / TOTAL_DURATION).toFixed(4)));
}

/**
 * Cấu hình phân cấp theo đúng yêu cầu:
 * 1. 3s đầu: chia thành 3 cấp (0s -> 1s -> 2s -> 3s)
 * 2. 3s -> 5.5s: chia thành 3 cấp (3s -> 3.83s -> 4.67s -> 5.5s)
 * 3. 5.5s -> 6.5s: chia thành 2 cấp (5.5s -> 6.0s -> 6.5s)
 * 4. 6.5s -> 8s: chia thành 3 cấp (6.5s -> 7.0s -> 7.5s -> 8.0s)
 * 5. 8s -> hết (9.93s): chia thành 3 cấp (8.0s -> 8.64s -> 9.29s -> 9.93s)
 */
export const STAGES_CONFIG: StageInfo[] = [
  // Đoạn 1: 3 giây đầu (3 cấp nhỏ: 0s -> 1s, 1s -> 2s, 2s -> 3s)
  { index: 0, stageNumber: 1, timeSec: 0.00, progress: 0.0000, title: 'Cấp 1: Toàn cảnh khởi đầu (0.0s)', section: '3 giây đầu', subtitle: 'Toàn cảnh từ xa, chuẩn bị tiếp cận mặt tiền' },
  { index: 1, stageNumber: 2, timeSec: 1.00, progress: toP(1.00), title: 'Cấp 2: Bắt đầu tiến tới (1.0s)', section: '3 giây đầu', subtitle: 'Hạ thấp góc nhìn, tiếp cận khu vực đường ngõ' },
  { index: 2, stageNumber: 3, timeSec: 2.00, progress: toP(2.00), title: 'Cấp 3: Sát ranh giới mặt tiền (2.0s)', section: '3 giây đầu', subtitle: 'Bay ngang hàng rào bao quanh ngôi nhà' },
  { index: 3, stageNumber: 4, timeSec: 3.00, progress: toP(3.00), title: 'Cấp 4: Đứng trước cổng rào (3.0s)', section: '3s -> 5.5s', subtitle: 'Dừng trước cổng sắt, hoàn tất 3 giây đầu' },

  // Đoạn 2: Giây thứ 3 -> Giây 5.5 (3 cấp nhỏ: 3s -> 3.83s -> 4.67s -> 5.5s)
  { index: 4, stageNumber: 5, timeSec: 3.83, progress: toP(3.833), title: 'Cấp 5: Bay qua cổng sắt (3.8s)', section: '3s -> 5.5s', subtitle: 'Vượt qua cổng chính, mở ra khoảng sân tiền sảnh' },
  { index: 5, stageNumber: 6, timeSec: 4.67, progress: toP(4.667), title: 'Cấp 6: Tiến sâu vào khoảng sân (4.7s)', section: '3s -> 5.5s', subtitle: 'Lướt thẳng qua thảm cỏ sân trước' },
  { index: 6, stageNumber: 7, timeSec: 5.50, progress: toP(5.50), title: 'Cấp 7: Tiếp cận thềm tiền sảnh (5.5s)', section: '5.5s -> 6.5s', subtitle: 'Dừng trước thềm sảnh, hoàn tất mốc 5.5 giây' },

  // Đoạn 3: Giây thứ 5.5 -> Giây 6.5 (2 cấp nhỏ: 5.5s -> 6.0s -> 6.5s)
  { index: 7, stageNumber: 8, timeSec: 6.00, progress: toP(6.00), title: 'Cấp 8: Tiến lên bậc thềm (6.0s)', section: '5.5s -> 6.5s', subtitle: 'Bước lên bậc tam cấp đá' },
  { index: 8, stageNumber: 9, timeSec: 6.50, progress: toP(6.50), title: 'Cấp 9: Đứng trước hiên sảnh (6.5s)', section: '6.5s -> 8.0s', subtitle: 'Đứng vững trước hiên, sẵn sàng tiến sát cửa kính' },

  // Đoạn 4: Giây thứ 6.5 -> Giây 8.0 (3 cấp nhỏ: 6.5s -> 7.0s -> 7.5s -> 8.0s)
  { index: 9, stageNumber: 10, timeSec: 7.00, progress: toP(7.00), title: 'Cấp 10: Tiếp cận cửa chính (7.0s)', section: '6.5s -> 8.0s', subtitle: 'Tiến sát khung cửa chính lớn' },
  { index: 10, stageNumber: 11, timeSec: 7.50, progress: toP(7.50), title: 'Cấp 11: Cửa chính bắt đầu mở (7.5s)', section: '6.5s -> 8.0s', subtitle: 'Cánh cửa mở ra, ánh sáng nội thất rọi ra ngoài' },
  { index: 11, stageNumber: 12, timeSec: 8.00, progress: toP(8.00), title: 'Cấp 12: Đứng tại bậu cửa (8.0s)', section: '8.0s -> hết', subtitle: 'Chạm mốc 8 giây, chuẩn bị bước vào phòng' },

  // Đoạn 5: Giây thứ 8 -> Hết (3 cấp nhỏ: 8.0s -> 8.64s -> 9.29s -> 9.93s)
  { index: 12, stageNumber: 13, timeSec: 8.64, progress: toP(8.644), title: 'Cấp 13: Bước qua ngưỡng cửa (8.6s)', section: '8.0s -> hết', subtitle: 'Bước chân vào không gian phòng khách' },
  { index: 13, stageNumber: 14, timeSec: 9.29, progress: toP(9.289), title: 'Cấp 14: Lướt vào trung tâm phòng (9.3s)', section: '8.0s -> hết', subtitle: 'Bao quát sofa và nội thất trang trí' },
  { index: 14, stageNumber: 15, timeSec: 9.93, progress: 1.0000, title: 'Cấp 15: Điểm nhìn hoàn tất (9.9s)', section: '8.0s -> hết', subtitle: 'Dừng tại trung tâm nhà, hoàn tất toàn bộ hành trình' },
];

export interface VideoMetadata {
  name: string;
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
  fps: number;
  fileSize?: number;
  sourceType: 'file' | 'url' | 'frames';
  totalFrames?: number;
}

export interface ScrollPhysicsConfig {
  sensitivity: number;
  damping: number;
  gestureThreshold: number;
  cooldownMs: number;
  motionMode: MotionMode;
}

export interface ScrollerStatus {
  progress: number;
  currentTime: number;
  duration: number;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  isScrubbing: boolean;
  activeStage: number; // 1..15
  targetStage: number; // 1..15
  totalStages: number;
}

export interface AppEvents {
  'scroll:progress': (progress: number) => void;
  'scroll:start': () => void;
  'scroll:end': () => void;
  'stage:changed': (activeStage: number, targetStage: number, stageInfo: StageInfo) => void;
  'motion:mode-changed': (mode: MotionMode) => void;
  'video:loaded': (meta: VideoMetadata) => void;
  'video:error': (err: string) => void;
  'video:mode-change': (mode: ScrollerDisplayMode) => void;
  'physics:change': (config: Partial<ScrollPhysicsConfig>) => void;
  'notification:show': (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}
