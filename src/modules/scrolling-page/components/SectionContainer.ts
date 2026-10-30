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
    if (layout.width) sec.style.width = layout.width;
    if (layout.maxWidth) sec.style.maxWidth = layout.maxWidth;
    if ((layout.width && layout.width !== '100%') || (layout.maxWidth && layout.maxWidth !== 'none' && layout.maxWidth !== '100%')) {
      sec.style.marginLeft = 'auto';
      sec.style.marginRight = 'auto';
    }
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
    const transformParts: string[] = [];
    if (cfg.position === 'absolute' || cfg.position === 'fixed') {
      if (cfg.x) {
        if (cfg.x === 'center') {
          blockElement.style.left = '50%';
          transformParts.push('translateX(-50%)');
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
          transformParts.push('translateY(-50%)');
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

    // Transforms: Rotate & Scale
    if (blockSchema.transform?.rotate) {
      transformParts.push(`rotate(${blockSchema.transform.rotate}deg)`);
    }
    if (blockSchema.transform?.scale !== undefined && blockSchema.transform.scale !== 1) {
      transformParts.push(`scale(${blockSchema.transform.scale})`);
    }
    if (transformParts.length > 0) {
      blockElement.style.transform = transformParts.join(' ');
    }

    // Styling
    const st = blockSchema.styling;
    if (st.background) blockElement.style.background = st.background;
    if (st.backdropBlur) blockElement.style.backdropFilter = `blur(${st.backdropBlur})`;

    // Border Radius: Individual corners or unified
    if (st.borderRadiusIndividual) {
      const bi = st.borderRadiusIndividual;
      if (bi.topLeft) blockElement.style.borderTopLeftRadius = bi.topLeft;
      if (bi.topRight) blockElement.style.borderTopRightRadius = bi.topRight;
      if (bi.bottomRight) blockElement.style.borderBottomRightRadius = bi.bottomRight;
      if (bi.bottomLeft) blockElement.style.borderBottomLeftRadius = bi.bottomLeft;
    } else if (st.borderRadius) {
      blockElement.style.borderRadius = st.borderRadius;
    }

    if (st.border) blockElement.style.border = st.border;

    // Shadow Presets or Custom Shadow
    if (st.shadowPreset && st.shadowPreset !== 'custom') {
      const presetShadows: Record<string, string> = {
        'none': 'none',
        'editorial': '0 20px 40px -15px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.15)',
        'soft-ambient': '0 30px 60px rgba(0,0,0,0.35), 0 12px 24px rgba(0,0,0,0.2)',
        'deep-floating': '0 35px 80px rgba(0,0,0,0.7), 0 15px 35px rgba(0,0,0,0.45)',
        'dramatic': '0 50px 100px -20px rgba(0,0,0,0.85), 0 30px 60px -30px rgba(0,0,0,0.9)',
        'glow-cyan': '0 20px 50px rgba(56, 189, 248, 0.25), 0 0 25px rgba(56, 189, 248, 0.15)'
      };
      blockElement.style.boxShadow = presetShadows[st.shadowPreset] || 'none';
    } else if (st.shadow) {
      blockElement.style.boxShadow = st.shadow;
    }

    if (st.opacity !== undefined) blockElement.style.opacity = String(st.opacity);
    if (st.padding) blockElement.style.padding = st.padding;
    if (st.margin) blockElement.style.margin = st.margin;
    if (st.overflow) blockElement.style.overflow = st.overflow;

    // Multi-speed Parallax speed data attribute
    if (blockSchema.animation?.parallaxSpeed !== undefined) {
      blockElement.dataset.parallaxSpeed = String(blockSchema.animation.parallaxSpeed);
    }

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
