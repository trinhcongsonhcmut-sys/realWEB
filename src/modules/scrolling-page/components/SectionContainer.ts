import { SectionSchema, PopupBlockSchema } from '../../shared/schemas/page.types';
import { DomUtils } from '../../shared/utils/domUtils';

export class SectionContainer {
  public schema: SectionSchema;
  public element: HTMLElement;
  public blockElements: Map<string, HTMLElement> = new Map();

  constructor(schema: SectionSchema) {
    this.schema = schema;
    this.element = this.render();
  }

  private render(): HTMLElement {
    const sec = DomUtils.createElement('section', `page-section section-${this.schema.type}`);
    sec.id = `section-${this.schema.id}`;
    sec.dataset.sectionId = this.schema.id;

    // Apply layout
    const layout = this.schema.layout;
    if (layout.height) sec.style.height = layout.height;
    if (layout.minHeight) sec.style.minHeight = layout.minHeight;
    if (layout.background) sec.style.background = layout.background;

    if (layout.sticky) {
      sec.classList.add('section-sticky');
    }

    if (layout.parallax) {
      sec.classList.add('section-parallax');
    }

    // Inner wrapper for positioning blocks
    const wrapper = DomUtils.createElement('div', 'section-inner-wrapper');
    sec.appendChild(wrapper);

    return sec;
  }

  public getInnerWrapper(): HTMLElement {
    return this.element.querySelector('.section-inner-wrapper') || this.element;
  }

  public appendBlock(blockSchema: PopupBlockSchema, blockElement: HTMLElement): void {
    const wrapper = this.getInnerWrapper();

    // Configure positioning and overlapping
    const cfg = blockSchema.layout;
    blockElement.style.position = cfg.position || 'relative';

    // Width & Height
    if (cfg.width) blockElement.style.width = cfg.width;
    if (cfg.height) blockElement.style.height = cfg.height;
    if (cfg.minWidth) blockElement.style.minWidth = cfg.minWidth;
    if (cfg.maxWidth) blockElement.style.maxWidth = cfg.maxWidth;
    if (cfg.aspectRatio) blockElement.style.aspectRatio = cfg.aspectRatio;
    if (cfg.zIndex !== undefined) blockElement.style.zIndex = String(cfg.zIndex);

    // X/Y coordinates if absolute or fixed
    if (cfg.position === 'absolute' || cfg.position === 'fixed') {
      if (cfg.x) {
        if (cfg.x === 'center') {
          blockElement.style.left = '50%';
          blockElement.style.transform = 'translateX(-50%)';
        } else if (cfg.x === 'left') {
          blockElement.style.left = '40px';
        } else if (cfg.x === 'right') {
          blockElement.style.right = '40px';
          blockElement.style.left = 'auto';
        } else {
          blockElement.style.left = cfg.x;
        }
      }

      if (cfg.y) {
        if (cfg.y === 'center') {
          blockElement.style.top = '50%';
          if (cfg.x === 'center') {
            blockElement.style.transform = 'translate(-50%, -50%)';
          } else {
            blockElement.style.transform = 'translateY(-50%)';
          }
        } else if (cfg.y === 'top') {
          blockElement.style.top = '40px';
        } else if (cfg.y === 'bottom') {
          blockElement.style.bottom = '40px';
          blockElement.style.top = 'auto';
        } else {
          blockElement.style.top = cfg.y;
        }
      }
    }

    // Styling
    const st = blockSchema.styling;
    if (st.background) blockElement.style.background = st.background;
    if (st.backdropBlur) blockElement.style.backdropFilter = `blur(${st.backdropBlur})`;
    if (st.borderRadius) blockElement.style.borderRadius = st.borderRadius;
    if (st.border) blockElement.style.border = st.border;
    if (st.shadow) blockElement.style.boxShadow = st.shadow;
    if (st.opacity !== undefined) blockElement.style.opacity = String(st.opacity);
    if (st.padding) blockElement.style.padding = st.padding;
    if (st.margin) blockElement.style.margin = st.margin;

    if (st.hideHeader) {
      blockElement.classList.add('popup-no-header');
    } else {
      blockElement.classList.remove('popup-no-header');
    }

    if (st.transparentBackground) {
      blockElement.classList.add('popup-transparent-bg');
    } else {
      blockElement.classList.remove('popup-transparent-bg');
    }

    // Auto-expand wrapper height if blocks extend down, allowing full scrolling
    const parsedY = parseInt(cfg.y || '0', 10);
    const parsedH = parseInt(cfg.height || '350', 10);
    if (!isNaN(parsedY) && !isNaN(parsedH) && (parsedY + parsedH) > 500) {
      const currentMin = parseInt(wrapper.style.minHeight || '0', 10);
      const needed = parsedY + parsedH + 100;
      if (needed > currentMin) {
        wrapper.style.minHeight = `${needed}px`;
      }
    }

    // Animation classes
    if (blockSchema.animation) {
      blockElement.classList.add(`anim-${blockSchema.animation.entrance}`);
      blockElement.style.transitionDuration = `${blockSchema.animation.duration}ms`;
      if (blockSchema.animation.delay) {
        blockElement.style.transitionDelay = `${blockSchema.animation.delay}ms`;
      }
    }

    // Always make blocks visible immediately if in builder or by default
    if (blockElement.classList.contains('builder-block-editable')) {
      blockElement.classList.add('block-entered');
    }

    wrapper.appendChild(blockElement);
    this.blockElements.set(blockSchema.id, blockElement);
  }

  public updateVisibility(ratio: number): void {
    if (ratio > 0.05) {
      this.element.classList.add('section-in-view');
      this.blockElements.forEach((el) => {
        el.classList.add('block-entered');
      });
    }
  }

  public dispose(): void {
    this.blockElements.clear();
    this.element.remove();
  }
}
