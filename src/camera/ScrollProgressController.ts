export class ScrollProgressController {
  public currentProgress: number = 0.0;
  public targetProgress: number = 0.0;

  // Calibrated for silky-smooth cinematic video scrubbing
  public sensitivity: number = 0.00025;
  public damping: number = 5.2;

  private isEnabled: boolean = true;
  private onProgressChangeCallback?: (progress: number) => void;

  constructor(sensitivity: number = 0.00025, damping: number = 5.2) {
    this.sensitivity = sensitivity;
    this.damping = damping;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public setCallback(cb: (progress: number) => void): void {
    this.onProgressChangeCallback = cb;
  }

  /**
   * Handles scroll wheel input with soft-compression to avoid sudden leaps.
   * Wheel down (deltaY > 0): advances forward.
   * Wheel up (deltaY < 0): steps backward.
   */
  public handleWheel(e: WheelEvent): void {
    if (!this.isEnabled) return;

    let rawDelta = e.deltaY;
    if (e.deltaMode === 1) {
      // Line mode (Firefox)
      rawDelta = e.deltaY * 20;
    } else if (e.deltaMode === 2) {
      // Page mode
      rawDelta = e.deltaY * 200;
    }

    // Soft-clamp delta per wheel notch to eliminate abrupt jumps
    const sign = Math.sign(rawDelta);
    const absDelta = Math.abs(rawDelta);
    // Compress higher speed bursts smoothly
    const normalizedDelta = sign * Math.min(absDelta, 100);

    const progressDelta = normalizedDelta * this.sensitivity;
    this.addDelta(progressDelta);
  }

  /**
   * Handles touch/swipe input (swipe distance in pixels).
   * Swiping up (deltaY < 0): move forward.
   */
  public handleTouchSwipe(deltaPixelY: number): void {
    if (!this.isEnabled) return;
    const progressDelta = -deltaPixelY * (this.sensitivity * 2.0);
    this.addDelta(progressDelta);
  }

  public addDelta(delta: number): void {
    this.targetProgress = Math.max(0.0, Math.min(1.0, this.targetProgress + delta));
  }

  public setProgress(progress: number, immediate: boolean = false): void {
    this.targetProgress = Math.max(0.0, Math.min(1.0, progress));
    if (immediate) {
      this.currentProgress = this.targetProgress;
      if (this.onProgressChangeCallback) {
        this.onProgressChangeCallback(this.currentProgress);
      }
    }
  }

  /**
   * Updates currentProgress smoothly towards targetProgress using frame-rate independent exponential decay.
   * Provides silky glide like video playback without micro-stutters.
   */
  public update(delta: number): boolean {
    const diff = this.targetProgress - this.currentProgress;
    if (Math.abs(diff) > 0.00002) {
      // Frame-rate independent exponential smoothing (Apple / Lenis style)
      const smoothingFactor = 1.0 - Math.exp(-this.damping * delta);
      this.currentProgress += diff * smoothingFactor;
      // Clamp strictly
      this.currentProgress = Math.max(0.0, Math.min(1.0, this.currentProgress));

      if (this.onProgressChangeCallback) {
        this.onProgressChangeCallback(this.currentProgress);
      }
      return true; // Progress is actively changing
    } else if (this.currentProgress !== this.targetProgress) {
      this.currentProgress = this.targetProgress;
      if (this.onProgressChangeCallback) {
        this.onProgressChangeCallback(this.currentProgress);
      }
    }
    return false;
  }
}
