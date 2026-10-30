import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';

export interface ComparisonBlockContent {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export class ComparisonBlock extends BaseBlock<ComparisonBlockContent> {
  constructor(schema: PopupBlockSchema<ComparisonBlockContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', 'block-popup block-comparison');
    const c = this.schema.content;

    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'So Sánh Hiện Trạng & Thiết Kế'}</span>
        <span class="popup-badge">Before / After</span>
      </div>
      <div class="popup-content-body">
        <div class="comparison-slider-wrap" id="slider-wrap-${this.schema.id}">
          <div class="comp-img-layer comp-before">
            <img src="${c.beforeImage}" alt="Before" />
            <span class="comp-tag">${c.beforeLabel || 'Hiện trạng'}</span>
          </div>
          <div class="comp-img-layer comp-after" id="after-layer-${this.schema.id}">
            <img src="${c.afterImage}" alt="After" />
            <span class="comp-tag comp-tag-after">${c.afterLabel || 'Thiết kế 3D'}</span>
          </div>
          <input type="range" min="0" max="100" value="50" class="comp-range-input" id="range-${this.schema.id}" />
        </div>
      </div>
    `;

    setTimeout(() => {
      const range = card.querySelector(`#range-${this.schema.id}`) as HTMLInputElement;
      const afterLayer = card.querySelector(`#after-layer-${this.schema.id}`) as HTMLElement;
      range?.addEventListener('input', () => {
        const val = range.value;
        if (afterLayer) {
          afterLayer.style.clipPath = `inset(0 0 0 ${val}%)`;
        }
      });
    }, 20);

    return card;
  }
}

