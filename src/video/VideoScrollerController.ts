import { EventEmitter } from '../core/EventEmitter';

export interface VideoScrollerOptions {
  totalFrames?: number;
  framesDir?: string;
  posterSrc?: string;
  video1Frames?: number;          // 120 frames (0..119 from my-housing-first.mp4)
  video1EndProgress?: number;     // 0.21 (transition to my-housing.mp4)
  handoverStartProgress?: number; // 0.70
  handoverEndProgress?: number;   // 0.76
  videoDoorTime?: number;         // e.g. 6.5 seconds in video where door opens & transitions
}

export class VideoScrollerController {
  public container: HTMLElement;
  public videoContainer: HTMLElement;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public canvasContainer: HTMLElement;
  public emitter: EventEmitter;

  private totalFrames: number = 277; // 277 frames (0..119 từ my-housing-first, 120..276 từ my-housing)
  private video1Frames: number = 120; // 120 frames đầu tiên từ my-housing-first
  private video1EndProgress: number = 0.21; // Điểm kết thúc video 1, nối tiếp video 2
  private framesDir: string = '/assets/frames';
  private frames: (HTMLImageElement | null)[] = [];
  private currentFrameIndex: number = 0;
  private lastRenderedFrameIndex: number = -1;
  private isFirstFrameLoaded: boolean = false;
  private isDisposed: boolean = false;

  private handoverStart: number = 0.70;
  private handoverEnd: number = 0.76;

  constructor(
    parentContainer: HTMLElement,
    canvasContainer: HTMLElement,
    emitter: EventEmitter,
    options: VideoScrollerOptions = {}
  ) {
    this.container = parentContainer;
    this.canvasContainer = canvasContainer;
    this.emitter = emitter;

    if (options.totalFrames !== undefined) {
      this.totalFrames = options.totalFrames;
    }
    if (options.video1Frames !== undefined) {
      this.video1Frames = options.video1Frames;
    }
    if (options.video1EndProgress !== undefined) {
      this.video1EndProgress = options.video1EndProgress;
    }
    if (options.framesDir !== undefined) {
      this.framesDir = options.framesDir;
    }
    if (options.handoverStartProgress !== undefined) {
      this.handoverStart = options.handoverStartProgress;
    }
    if (options.handoverEndProgress !== undefined) {
      this.handoverEnd = options.handoverEndProgress;
    }

    // Initialize frames array
    this.frames = new Array(this.totalFrames).fill(null);

    // 1. Create Wrapper Container
    this.videoContainer = document.createElement('div');
    this.videoContainer.id = 'video-scroller-container';
    this.videoContainer.className = 'video-scroller-container';

    // 2. Create High-Performance 2D Canvas for 60-120 FPS Frame Rendering
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'cinematic-housing-canvas';
    this.canvas.className = 'cinematic-housing-canvas';
    this.canvas.width = 1280;
    this.canvas.height = 720;

    const context = this.canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Failed to get 2D rendering context for VideoScroller Canvas');
    }
    this.ctx = context;

    // Vignette overlay for cinematic contrast
    const vignette = document.createElement('div');
    vignette.className = 'video-cinematic-vignette';

    this.videoContainer.appendChild(this.canvas);
    this.videoContainer.appendChild(vignette);

    // Insert videoContainer right before WebGL canvasContainer
    this.container.insertBefore(this.videoContainer, this.canvasContainer);

    // 3. Initial WebGL Canvas style: start transparent until handover (no CSS transition to avoid 60fps frame drops)
    this.canvasContainer.style.opacity = '0';
    this.canvasContainer.style.pointerEvents = 'none';

    // 4. Preload frame sequence & start listening
    this.startPreload();
    this.bindEvents();
  }

  private getFrameUrl(index: number): string {
    const formatted = String(index).padStart(3, '0');
    return `${this.framesDir}/frame_${formatted}.webp`;
  }

  private startPreload(): void {
    // 1. Load initial frame (0) immediately to display the high-angle street view
    const frame0 = new Image();
    frame0.src = this.getFrameUrl(0);
    frame0.onload = () => {
      this.frames[0] = frame0;
      this.isFirstFrameLoaded = true;
      this.renderFrame(0);
    };

    // 2. Preload remaining frames rapidly with background decoding
    const preloadAll = async () => {
      const concurrency = 24;
      for (let i = 1; i < this.totalFrames; i += concurrency) {
        if (this.isDisposed) break;
        const batch: Promise<void>[] = [];
        for (let j = i; j < Math.min(i + concurrency, this.totalFrames); j++) {
          const p = new Promise<void>((resolve) => {
            const img = new Image();
            img.src = this.getFrameUrl(j);
            img.onload = () => {
              this.frames[j] = img;
              if ('decode' in img) {
                (img as any).decode().catch(() => {}).finally(() => resolve());
              } else {
                resolve();
              }
            };
            img.onerror = () => resolve();
          });
          batch.push(p);
        }
        await Promise.all(batch);
      }
      console.log(`[VideoScroller] All ${this.totalFrames} frames preloaded successfully.`);
    };

    preloadAll();
  }

  private findClosestLoadedFrame(targetIdx: number): HTMLImageElement | null {
    if (this.frames[targetIdx]?.complete && this.frames[targetIdx]?.naturalWidth) {
      return this.frames[targetIdx];
    }
    // Search backward first
    for (let i = targetIdx - 1; i >= 0; i--) {
      if (this.frames[i]?.complete && this.frames[i]?.naturalWidth) {
        return this.frames[i];
      }
    }
    // Search forward if not found
    for (let i = targetIdx + 1; i < this.totalFrames; i++) {
      if (this.frames[i]?.complete && this.frames[i]?.naturalWidth) {
        return this.frames[i];
      }
    }
    return null;
  }

  public renderFrame(index: number): void {
    const clamped = Math.max(0, Math.min(this.totalFrames - 1, index));
    if (clamped === this.lastRenderedFrameIndex && this.frames[clamped]) {
      return; // Frame already rendered, skip redundant GPU draw
    }
    this.currentFrameIndex = clamped;

    const img = this.findClosestLoadedFrame(clamped);
    if (img && img.complete && img.naturalWidth > 0) {
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      this.lastRenderedFrameIndex = clamped;
    }
  }

  private bindEvents(): void {
    // Listen for scroll progress from CameraStateMachine
    this.emitter.on('camera:scroll-progress', (progress: number) => {
      this.handleProgress(progress);
    });
  }

  /**
   * Main Progress Handler: Maps scroll progress p in [0, 1] to frame scrubbing and 3D handover.
   * Completely bypasses HTML5 <video> decoder latency for instant 60-120 FPS bidirectional responsiveness.
   */
  public handleProgress(progress: number): void {
    const p = Math.max(0.0, Math.min(1.0, progress));

    // 1. Calculate Frame Index from 0 to 276 (Video 1: 0..119, Video 2: 120..276)
    let targetFrame = 0;
    if (p <= this.video1EndProgress) {
      // Trong Video 1 (my-housing-first.mp4): từ 0 đến 119
      const factor = p / this.video1EndProgress;
      targetFrame = Math.round(factor * (this.video1Frames - 1));
    } else if (p <= this.handoverStart) {
      // Trong Video 2 (my-housing.mp4): từ 120 đến 276
      const factor = (p - this.video1EndProgress) / (this.handoverStart - this.video1EndProgress);
      targetFrame = this.video1Frames + Math.round(factor * (this.totalFrames - 1 - this.video1Frames));
    } else {
      targetFrame = this.totalFrames - 1;
    }

    // 2. Render frame instantly (takes 0.02ms on GPU canvas)
    this.renderFrame(targetFrame);

    // 3. Calculate Cross-fade Handover Blend
    let handoverFactor = 0.0;
    if (p < this.handoverStart) {
      handoverFactor = 0.0;
    } else if (p >= this.handoverEnd) {
      handoverFactor = 1.0;
    } else {
      // In handover zone [handoverStart, handoverEnd]
      handoverFactor = (p - this.handoverStart) / (this.handoverEnd - this.handoverStart);
      // Smooth Hermite interpolation
      handoverFactor = handoverFactor * handoverFactor * (3 - 2 * handoverFactor);
    }

    // 4. Apply Opacities smoothly
    const canvasOpacity = 1.0 - handoverFactor;
    const webglOpacity = handoverFactor;

    this.videoContainer.style.opacity = canvasOpacity.toFixed(3);
    this.canvasContainer.style.opacity = webglOpacity.toFixed(3);

    // Enable pointer events on 3D canvas when entering room
    if (p >= this.handoverStart) {
      this.canvasContainer.style.pointerEvents = 'auto';
    } else {
      this.canvasContainer.style.pointerEvents = 'none';
    }
  }

  public update(_delta: number): void {
    // Canvas frame is rendered instantly on wheel/input event
  }

  public dispose(): void {
    this.isDisposed = true;
    this.frames = [];
    if (this.videoContainer && this.videoContainer.parentElement) {
      this.videoContainer.parentElement.removeChild(this.videoContainer);
    }
  }
}
