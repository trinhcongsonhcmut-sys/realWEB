import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { VideoScrollerEngine } from '../../../video/VideoScrollerEngine';
import { ScrollMotionEngine } from '../../../motion/ScrollMotionEngine';
import { DomUtils } from '../../shared/utils/domUtils';

export interface HeroVideoContent {
  manifestUrl: string;
  totalFrames?: number;
  fps?: number;
  title?: string;
  subtitle?: string;
}

export class HeroVideoBlock extends BaseBlock<HeroVideoContent> {
  private videoEngine?: VideoScrollerEngine;
  private motionEngine?: ScrollMotionEngine;

  constructor(schema: PopupBlockSchema<HeroVideoContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const container = DomUtils.createElement('div', 'block-hero-video');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';

    const canvasContainer = DomUtils.createElement('div', 'hero-canvas-inner-wrap');
    canvasContainer.style.width = '100%';
    canvasContainer.style.height = '100%';
    canvasContainer.style.position = 'absolute';
    canvasContainer.style.top = '0';
    canvasContainer.style.left = '0';
    container.appendChild(canvasContainer);

    // Overlay hint
    const hint = DomUtils.createElement('div', 'hero-scroll-hint');
    hint.innerHTML = `
      <div class="hint-mouse">
        <div class="hint-wheel"></div>
      </div>
      <span>Cuộn chuột để tiếp cận dự án (15 mốc chuyển động)</span>
    `;
    container.appendChild(hint);

    // Initialize engines
    setTimeout(async () => {
      this.videoEngine = new VideoScrollerEngine(canvasContainer, this.emitter);
      const manifestUrl = this.schema.content?.manifestUrl || '/assets/frames/manifest.json';
      try {
        await this.videoEngine.loadFrameSequence(manifestUrl);
      } catch (err) {
        console.warn('Could not load frame sequence for HeroVideoBlock:', err);
      }

      this.motionEngine = new ScrollMotionEngine(this.emitter);
      this.motionEngine.bind(window);

      this.emitter.on('motion:stage-change', (currentStage: number) => {
        if (currentStage > 1) {
          hint.style.opacity = '0';
          hint.style.pointerEvents = 'none';
        } else {
          hint.style.opacity = '1';
        }
      });
    }, 50);

    return container;
  }

  public dispose(): void {
    this.motionEngine?.unbind();
    this.videoEngine?.dispose();
    super.dispose();
  }
}
