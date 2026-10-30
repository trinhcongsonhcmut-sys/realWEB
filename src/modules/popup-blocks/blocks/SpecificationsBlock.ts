import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';

export interface SpecRow {
  label: string;
  value: string;
}

export interface SpecificationsContent {
  priceDisplay?: string;
  specs: SpecRow[];
}

export class SpecificationsBlock extends BaseBlock<SpecificationsContent> {
  constructor(schema: PopupBlockSchema<SpecificationsContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', 'block-popup block-specifications');
    const c = this.schema.content;

    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'Thông Số Bất Động Sản'}</span>
        ${c.priceDisplay ? `<span class="popup-price-badge">${c.priceDisplay}</span>` : ''}
      </div>
      <div class="popup-content-body">
        <div class="specs-grid">
          ${(c.specs || [])
            .map(
              (s) => `
            <div class="spec-cell">
              <div class="spec-label">${s.label}</div>
              <div class="spec-val">${s.value}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    return card;
  }
}

