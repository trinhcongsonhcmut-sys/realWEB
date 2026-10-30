import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';

export interface GalleryItem {
  url: string;
  title: string;
  description?: string;
}

export interface GalleryBlockContent {
  items: GalleryItem[];
}

export class GalleryBlock extends BaseBlock<GalleryBlockContent> {
  private activeIndex: number = 0;

  constructor(schema: PopupBlockSchema<GalleryBlockContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', 'block-popup block-gallery');
    const items = this.schema.content.items || [];
    const current = items[this.activeIndex] || { url: '', title: '' };

    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'Bộ Sưu Tập Hình Ảnh Dự Án'}</span>
        <span class="popup-badge">${items.length} ảnh</span>
      </div>
      <div class="popup-content-body">
        <div class="gallery-main-view">
          <img src="${current.url}" alt="${current.title}" class="gallery-main-img" id="gallery-main-${this.schema.id}" />
          <div class="gallery-main-caption" id="gallery-cap-${this.schema.id}">${current.title}</div>
        </div>
        <div class="gallery-thumbs-row">
          ${items
            .map(
              (it, idx) => `
            <div class="gallery-thumb-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
              <img src="${it.url}" alt="${it.title}" />
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    card.querySelectorAll('.gallery-thumb-item').forEach((thumb) => {
      thumb.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).dataset.idx || '0', 10);
        this.activeIndex = idx;
        const mainImg = card.querySelector(`#gallery-main-${this.schema.id}`) as HTMLImageElement;
        const mainCap = card.querySelector(`#gallery-cap-${this.schema.id}`) as HTMLElement;
        if (mainImg && items[idx]) {
          mainImg.src = items[idx].url;
          if (mainCap) mainCap.textContent = items[idx].title;
        }
        card.querySelectorAll('.gallery-thumb-item').forEach((t) => t.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
      });
    });

    return card;
  }
}

