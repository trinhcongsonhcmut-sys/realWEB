import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';

export interface TextBlockContent {
  tagline?: string;
  headline: string;
  description: string;
  bulletPoints?: string[];
  ctaText?: string;
  ctaLink?: string;
}

export class TextBlock extends BaseBlock<TextBlockContent> {
  constructor(schema: PopupBlockSchema<TextBlockContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', 'block-popup block-text');
    const c = this.schema.content;

    const bulletsHtml = c.bulletPoints && c.bulletPoints.length > 0
      ? `<ul class="popup-bullets">${c.bulletPoints.map((bp) => `<li><span class="bullet-dot"></span><span>${bp}</span></li>`).join('')}</ul>`
      : '';

    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'Thông Tin Giới Thiệu'}</span>
      </div>
      <div class="popup-content-body">
        ${c.tagline ? `<div class="popup-tagline">${c.tagline}</div>` : ''}
        <h3 class="popup-headline">${c.headline}</h3>
        <p class="popup-desc">${c.description}</p>
        ${bulletsHtml}
        ${c.ctaText ? `<button class="popup-cta-btn" id="btn-cta-${this.schema.id}">${c.ctaText}</button>` : ''}
      </div>
    `;

    if (c.ctaText) {
      card.querySelector(`#btn-cta-${this.schema.id}`)?.addEventListener('click', () => {
        this.emitter.emit('block:cta-click', { blockId: this.schema.id, link: c.ctaLink });
      });
    }

    return card;
  }
}

