/**
 * ScrollMotionEngine.ts
 * High-performance, cross-platform scroll & gesture motion physics engine.
 * Fully customized according to user request:
 * - 0s -> 3s: 3 cấp nhỏ
 * - 3s -> 5.5s: 3 cấp nhỏ
 * - 5.5s -> 6.5s: 2 cấp nhỏ
 * - 6.5s -> 8.0s: 3 cấp nhỏ
 * - 8.0s -> hết: 3 cấp nhỏ
 * (Tổng cộng 14 bước chuyển tương ứng 15 cấp độ mốc thời gian)
 */

import { EventEmitter } from '../core/EventEmitter';
import { MotionMode, StageInfo, STAGES_CONFIG, ScrollPhysicsConfig } from '../types';

export class ScrollMotionEngine {
  public currentProgress: number = 0.0;
  public targetProgress: number = 0.0;

  // Mode: Continuous Fluid Scrub (Default for RenderAHouse/Apple style) or Discrete Stages
  public motionMode: MotionMode = 'continuous';
  public stages: StageInfo[] = STAGES_CONFIG;

  // Stage state (indices 0..14 corresponding to Cấp 1..15)
  public targetStageIndex: number = 0;
  public activeStageIndex: number = 0;
  public isAnimatingStage: boolean = false;
  private stageAnimStartTime: number = 0;
  private stageAnimElapsed: number = 0;
  private stageAnimStartProgress: number = 0;
  private stageAnimTargetProgress: number = 0;
  // Stage animation duration: snappy and responsive (420ms)
  private stageAnimDuration: number = 420; 

  // Wheel Gesture Normalization for discrete mode
  private accumulatedDeltaY: number = 0;
  private lastWheelIntentTime: number = 0;
  private gestureCooldownMs: number = 150;
  private gestureThreshold: number = 70;

  // Continuous fluid physics parameters (60-120 FPS buttery smooth)
  public sensitivity: number = 0.00032;
  public damping: number = 7.5;
  public isEnabled: boolean = true;

  // Auto-play state
  public isPlaying: boolean = false;
  public playbackRate: number = 1.0;

  // Internal loop state
  private targetElement: HTMLElement | Window | null = null;
  private emitter: EventEmitter;
  private isRafRunning: boolean = false;
  private lastRafTimestamp: number = performance.now();
  private rafId: number = 0;

  // Touch tracking
  private touchStartY: number = 0;
  private touchStartX: number = 0;
  private lastTouchY: number = 0;
  private isTouching: boolean = false;

  constructor(emitter: EventEmitter, config?: Partial<ScrollPhysicsConfig>) {
    this.emitter = emitter;
    if (config?.sensitivity !== undefined) this.sensitivity = config.sensitivity;
    if (config?.damping !== undefined) this.damping = config.damping;
    if (config?.motionMode !== undefined) this.motionMode = config.motionMode;

    this.onWheel = this.onWheel.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.animate = this.animate.bind(this);
  }

  // Singleton guard to prevent duplicate ghost listeners & competing RAF loops
  private static activeInstance: ScrollMotionEngine | null = null;

  public bind(element: HTMLElement | Window = window): void {
    if (ScrollMotionEngine.activeInstance && ScrollMotionEngine.activeInstance !== this) {
      ScrollMotionEngine.activeInstance.unbind();
    }
    ScrollMotionEngine.activeInstance = this;

    this.unbind();
    this.targetElement = element;

    element.addEventListener('wheel', this.onWheel as EventListener, { passive: false });
    element.addEventListener('touchstart', this.onTouchStart as EventListener, { passive: true });
    element.addEventListener('touchmove', this.onTouchMove as EventListener, { passive: false });
    element.addEventListener('touchend', this.onTouchEnd as EventListener, { passive: true });
    window.addEventListener('keydown', this.onKeyDown);

    const canvasArea = document.querySelector('.builder-canvas-area') as HTMLElement | null;
    if (canvasArea && (canvasArea as any) !== element) {
      canvasArea.addEventListener('wheel', this.onWheel as EventListener, { passive: false });
      canvasArea.addEventListener('touchmove', this.onTouchMove as EventListener, { passive: false });
    }

    this.startLoop();
  }

  public unbind(): void {
    if (this.targetElement) {
      this.targetElement.removeEventListener('wheel', this.onWheel as EventListener);
      this.targetElement.removeEventListener('touchstart', this.onTouchStart as EventListener);
      this.targetElement.removeEventListener('touchmove', this.onTouchMove as EventListener);
      this.targetElement.removeEventListener('touchend', this.onTouchEnd as EventListener);
      this.targetElement = null;
    }
    const canvasArea = document.querySelector('.builder-canvas-area') as HTMLElement | null;
    if (canvasArea) {
      canvasArea.removeEventListener('wheel', this.onWheel as EventListener);
      canvasArea.removeEventListener('touchmove', this.onTouchMove as EventListener);
    }
    window.removeEventListener('keydown', this.onKeyDown);
    if (ScrollMotionEngine.activeInstance === this) {
      ScrollMotionEngine.activeInstance = null;
    }
    this.stopLoop();
  }

  public setMotionMode(mode: MotionMode): void {
    if (this.motionMode === mode) return;
    this.motionMode = mode;
    this.isAnimatingStage = false;
    this.targetProgress = this.currentProgress;
    this.targetStageIndex = this.findNearestStageIndex(this.currentProgress);
    this.activeStageIndex = this.targetStageIndex;
    this.emitter.emit('motion:mode-changed', mode);
  }

  public findNearestStageIndex(progress: number): number {
    let nearest = 0;
    let minDist = 999;
    for (let i = 0; i < this.stages.length; i++) {
      const dist = Math.abs(this.stages[i].progress - progress);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    }
    return nearest;
  }

  /**
   * Jump or animate directly to specific stage index (0..14)
   */
  public goToStage(stageIndex: number, animate: boolean = true): void {
    const clamped = Math.max(0, Math.min(this.stages.length - 1, stageIndex));
    this.targetStageIndex = clamped;
    const targetP = this.stages[clamped].progress;

    if (!animate) {
      this.isAnimatingStage = false;
      this.currentProgress = targetP;
      this.targetProgress = targetP;
      this.activeStageIndex = clamped;
      this.emitter.emit('scroll:progress', this.currentProgress);
      this.emitter.emit('stage:changed', this.activeStageIndex + 1, this.targetStageIndex + 1, this.stages[clamped]);
      return;
    }

    // Mid-flight retargeting from current visual progress
    this.stageAnimStartProgress = this.currentProgress;
    this.stageAnimTargetProgress = targetP;
    this.stageAnimStartTime = performance.now();
    this.stageAnimElapsed = 0;

    const distance = Math.abs(this.activeStageIndex - clamped);
    this.stageAnimDuration = Math.min(750, Math.max(380, 350 + distance * 80));
    this.isAnimatingStage = true;

    this.emitter.emit('stage:changed', this.activeStageIndex + 1, this.targetStageIndex + 1, this.stages[clamped]);
  }

  /**
   * Step discrete stage forwards (+1) or backwards (-1)
   */
  public stepDiscreteStage(direction: -1 | 1): void {
    const nextStage = Math.max(0, Math.min(this.stages.length - 1, this.activeStageIndex + direction));
    this.goToStage(nextStage, true);
  }

  /**
   * Cross-platform Wheel Event Handler with Full Two-Way Section Handover
   * When video reaches the end -> smoothly transitions down to subsequent sections.
   * When video reaches the start (0%) -> smoothly transitions up to previous sections or top.
   */
  private onWheel(e: WheelEvent): void {
    if (!this.isEnabled) return;

    let rawDelta = e.deltaY;
    if (e.deltaMode === 1) rawDelta = e.deltaY * 24;
    else if (e.deltaMode === 2) rawDelta = e.deltaY * 200;

    if (Math.abs(e.deltaX) > Math.abs(rawDelta)) {
      rawDelta = e.deltaX;
    }

    const canvasArea = document.querySelector('.builder-canvas-area') as HTMLElement | null;
    const currentScrollTop = canvasArea ? canvasArea.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0);

    // CRITICAL FIX: Handover MUST check visual progress reaching 100% (>= 98.5%)
    const isVideoFullyComplete = this.currentProgress >= 0.985 && !this.isAnimatingStage;
    const isVideoAtStart = this.currentProgress <= 0.015 && !this.isAnimatingStage;

    // A. If already scrolled down past the hero video into lower sections (scrollTop > 100):
    if (currentScrollTop > 100) {
      // Allow natural page scrolling through popup cards and lower sections
      return;
    }

    // B. At the END of video (>= 98.5% visual progress) and scrolling DOWN:
    if (isVideoFullyComplete && rawDelta > 0) {
      this.accumulatedDeltaY = 0;
      this.isAnimatingStage = false;
      this.emitter.emit('scroll:completed');
      this.emitter.emit('motion:video-completed');

      // Handover: smoothly scroll down to Section 2 (next section)
      const allSections = document.querySelectorAll('.page-section');
      if (allSections.length > 1) {
        const nextSec = allSections[1] as HTMLElement;
        nextSec?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return; // Do NOT preventDefault! Let page scroll down naturally
    }

    // C. At the START of video (<= 1.5% visual progress) and scrolling UP:
    if (isVideoAtStart && rawDelta < 0) {
      this.accumulatedDeltaY = 0;
      this.isAnimatingStage = false;
      this.emitter.emit('motion:video-rewound');

      // Handover: allow scrolling up naturally
      if (currentScrollTop > 0) {
        if (canvasArea) {
          canvasArea.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return; // Do NOT preventDefault! Let page scroll up naturally
    }

    // D. Scrubbing within video: PREVENT normal page scroll to keep user in Section 1!
    e.preventDefault();

    // CONTINUOUS FLUID SCROLL MODE (Default - Silky Smooth 60-120 FPS)
    if (this.motionMode === 'continuous') {
      const sign = Math.sign(rawDelta);
      const clampedDelta = sign * Math.min(Math.abs(rawDelta), 120);
      this.addProgress(clampedDelta * this.sensitivity);
      return;
    }

    // DISCRETE STAGES MODE
    const now = performance.now();
    const timeSinceLast = now - this.lastWheelIntentTime;

    this.accumulatedDeltaY += rawDelta;

    if (Math.abs(this.accumulatedDeltaY) >= this.gestureThreshold) {
      const dir = Math.sign(this.accumulatedDeltaY) as -1 | 1;
      this.accumulatedDeltaY = 0;

      if (timeSinceLast >= this.gestureCooldownMs || !this.isAnimatingStage) {
        this.lastWheelIntentTime = now;
        this.stepDiscreteStage(dir);
      }
    }
  }

  private onTouchStart(e: TouchEvent): void {
    if (!this.isEnabled || e.touches.length === 0) return;
    this.isTouching = true;
    this.touchStartY = e.touches[0].clientY;
    this.lastTouchY = this.touchStartY;
  }

  private onTouchMove(e: TouchEvent): void {
    if (!this.isEnabled || !this.isTouching || e.touches.length === 0) return;

    const currentY = e.touches[0].clientY;
    const deltaY = this.lastTouchY - currentY;

    const isVideoFullyComplete = this.currentProgress >= 0.985 && !this.isAnimatingStage;
    const isVideoAtStart = this.currentProgress <= 0.015 && !this.isAnimatingStage;

    if (isVideoFullyComplete && deltaY > 0) {
      this.emitter.emit('scroll:completed');
      this.emitter.emit('motion:video-completed');
      const allSections = document.querySelectorAll('.page-section');
      if (allSections.length > 1) {
        allSections[1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    if (isVideoAtStart && deltaY < 0) {
      this.emitter.emit('motion:video-rewound');
      return;
    }

    if (e.cancelable) e.preventDefault();

    if (this.motionMode === 'continuous') {
      this.addProgress(deltaY * (this.sensitivity * 2.0));
      this.lastTouchY = currentY;
      return;
    }

    if (Math.abs(deltaY) > 24) {
      const dir = deltaY > 0 ? 1 : -1;
      this.stepDiscreteStage(dir as -1 | 1);
      this.lastTouchY = currentY;
    }
  }

  private onTouchEnd(): void {
    this.isTouching = false;
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.isEnabled) return;
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;

    if (this.motionMode === 'discrete_stages') {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          this.stepDiscreteStage(1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          this.stepDiscreteStage(-1);
          break;
        case 'Home':
          e.preventDefault();
          this.goToStage(0, true);
          break;
        case 'End':
          e.preventDefault();
          this.goToStage(this.stages.length - 1, true);
          break;
        case ' ':
          e.preventDefault();
          this.togglePlay();
          break;
      }
      return;
    }

    const step = 0.03;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        this.addProgress(step);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        this.addProgress(-step);
        break;
      case ' ':
        e.preventDefault();
        this.togglePlay();
        break;
    }
  }

  public addProgress(delta: number): void {
    if (this.isPlaying) this.pause();
    this.targetProgress = Math.max(0.0, Math.min(1.0, this.targetProgress + delta));
    this.targetStageIndex = this.findNearestStageIndex(this.targetProgress);
  }

  public setProgress(progress: number, immediate: boolean = false): void {
    const clamped = Math.max(0.0, Math.min(1.0, progress));
    this.targetProgress = clamped;
    this.targetStageIndex = this.findNearestStageIndex(clamped);

    if (immediate) {
      this.isAnimatingStage = false;
      this.currentProgress = clamped;
      this.activeStageIndex = this.targetStageIndex;
      this.emitter.emit('scroll:progress', this.currentProgress);
      this.emitter.emit('stage:changed', this.activeStageIndex + 1, this.targetStageIndex + 1, this.stages[this.activeStageIndex]);
    }
  }

  public togglePlay(): void {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  public play(rate: number = 1.0): void {
    this.isPlaying = true;
    this.playbackRate = rate;
    if (this.targetProgress >= 0.999) {
      this.setProgress(0.0, true);
    }
  }

  public pause(): void {
    this.isPlaying = false;
  }

  private startLoop(): void {
    if (this.isRafRunning) return;
    this.isRafRunning = true;
    this.lastRafTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.animate);
  }

  private stopLoop(): void {
    this.isRafRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private animate(now: number): void {
    if (!this.isRafRunning) return;

    const delta = Math.min(0.08, Math.max(0.001, (now - this.lastRafTimestamp) / 1000));
    this.lastRafTimestamp = now;

    // A. Discrete Stage Interpolation (Quintic Ease-Out)
    if (this.isAnimatingStage) {
      this.stageAnimElapsed += delta * 1000;
      const t = Math.max(0.0, Math.min(1.0, this.stageAnimElapsed / this.stageAnimDuration));

      const ease = 1.0 - Math.pow(1.0 - t, 3);

      this.currentProgress = this.stageAnimStartProgress +
        (this.stageAnimTargetProgress - this.stageAnimStartProgress) * ease;
      this.targetProgress = this.stageAnimTargetProgress;

      this.activeStageIndex = this.findNearestStageIndex(this.currentProgress);
      this.emitter.emit('scroll:progress', this.currentProgress);

      if (t >= 1.0) {
        this.isAnimatingStage = false;
        this.currentProgress = this.stageAnimTargetProgress;
        this.activeStageIndex = this.targetStageIndex;
        this.emitter.emit('scroll:progress', this.currentProgress);
        this.emitter.emit('stage:changed', this.activeStageIndex + 1, this.targetStageIndex + 1, this.stages[this.activeStageIndex]);
      }

      this.rafId = requestAnimationFrame(this.animate);
      return;
    }

    // B. Autoplay
    if (this.isPlaying) {
      const stepSpeed = (1.0 / 9.9) * this.playbackRate * delta;
      this.targetProgress = Math.min(1.0, this.targetProgress + stepSpeed);
      this.currentProgress = this.targetProgress;
      this.activeStageIndex = this.findNearestStageIndex(this.currentProgress);
      this.emitter.emit('scroll:progress', this.currentProgress);
      if (this.targetProgress >= 1.0) {
        this.isPlaying = false;
      }
      this.rafId = requestAnimationFrame(this.animate);
      return;
    }

    // C. Continuous Mode
    const diff = this.targetProgress - this.currentProgress;
    if (Math.abs(diff) > 0.00002) {
      const smoothing = 1.0 - Math.exp(-this.damping * delta);
      this.currentProgress += diff * smoothing;

      if (Math.abs(this.targetProgress - this.currentProgress) < 0.00003) {
        this.currentProgress = this.targetProgress;
      }

      this.activeStageIndex = this.findNearestStageIndex(this.currentProgress);
      this.emitter.emit('scroll:progress', this.currentProgress);
      this.emitter.emit('stage:changed', this.activeStageIndex + 1, this.activeStageIndex + 1, this.stages[this.activeStageIndex]);
      this.emitter.emit('motion:stage-change', this.activeStageIndex + 1);
    }

    this.rafId = requestAnimationFrame(this.animate);
  }

  public setSensitivity(val: number): void {
    this.sensitivity = Math.max(0.00005, Math.min(0.005, val));
  }

  public setDamping(val: number): void {
    this.damping = Math.max(1.0, Math.min(20.0, val));
  }
}
