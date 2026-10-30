export class ScrollProgressController {
  public currentProgress: number = 0;
  public targetProgress: number = 0;
  public sensitivity: number;
  public damping: number;
  private callback?: (progress: number) => void;

  constructor(sensitivity: number = 0.00025, damping: number = 5.2) {
    this.sensitivity = sensitivity;
    this.damping = damping;
  }

  public setCallback(cb: (p: number) => void): void {
    this.callback = cb;
  }

  public onWheel(deltaY: number): void {
    this.targetProgress = Math.max(0.0, Math.min(1.0, this.targetProgress + deltaY * this.sensitivity));
  }

  public setProgress(progress: number, immediate: boolean = false): void {
    const clamped = Math.max(0.0, Math.min(1.0, progress));
    this.targetProgress = clamped;
    if (immediate) {
      this.currentProgress = clamped;
      if (this.callback) this.callback(clamped);
    }
  }

  public update(delta: number): void {
    const diff = this.targetProgress - this.currentProgress;
    if (Math.abs(diff) > 0.00005) {
      const step = diff * Math.min(1.0, delta * this.damping);
      this.currentProgress += step;
      if (this.callback) {
        this.callback(this.currentProgress);
      }
    } else {
      if (this.currentProgress !== this.targetProgress) {
        this.currentProgress = this.targetProgress;
        if (this.callback) {
          this.callback(this.currentProgress);
        }
      }
    }
  }
}

