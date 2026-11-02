import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';

export interface InfoCardMetric {
  label: string;
  value: string;
}

export interface InfoCardContent {
  tagline?: string;
  title?: string;
  description?: string;
  price?: string;
  metrics?: InfoCardMetric[];
  ctaText?: string;
  ctaLink?: string;
}

export class InformationCardBlock extends BaseBlock<InfoCardContent> {
  constructor(schema: PopupBlockSchema<InfoCardContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', 'block-popup block-info-card');
    const c = this.schema.content || {};

    const metricsHtml = (c.metrics && c.metrics.length > 0)
      ? c.metrics.map(m => `
          <div class="info-metric-item">
            <span class="metric-label">${m.label}</span>
            <span class="metric-value">${m.value}</span>
          </div>
        `).join('')
      : '';

    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'Thông Tin BĐS'}</span>
        ${c.tagline ? `<span class="popup-badge">${c.tagline}</span>` : ''}
      </div>
      <div class="popup-content-body info-card-body">
        ${c.tagline ? `<div class="info-tagline">${c.tagline}</div>` : ''}
        <h3 class="info-card-title">${c.title || 'Villa Horizon Sanctuary'}</h3>
        ${c.description ? `<p class="info-card-desc">${c.description}</p>` : ''}
        
        ${c.price ? `
          <div class="info-price-wrap">
            <span class="price-sub">MỨC GIÁ DỰ KIẾN</span>
            <span class="price-main">${c.price}</span>
          </div>
        ` : ''}

        ${metricsHtml ? `<div class="info-metrics-grid">${metricsHtml}</div>` : ''}

        ${c.ctaText ? `
          <button type="button" class="info-cta-btn" onclick="${c.ctaLink ? `window.open('${c.ctaLink}', '_blank')` : ''}">
            <span>${c.ctaText}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        ` : ''}
      </div>
    `;

    return card;
  }
}

