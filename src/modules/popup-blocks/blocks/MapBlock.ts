import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';

export interface AmenityItem {
  icon: string;
  name: string;
  distance: string;
}

export interface MapBlockContent {
  address: string;
  latLng?: string;
  mapEmbedUrl?: string;
  amenities: AmenityItem[];
}

export class MapBlock extends BaseBlock<MapBlockContent> {
  constructor(schema: PopupBlockSchema<MapBlockContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', 'block-popup block-map');
    const c = this.schema.content;

    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'Vị Trí & Tiện Ích Kết Nối'}</span>
        <span class="popup-badge">Khu Vực</span>
      </div>
      <div class="popup-content-body">
        <div class="map-location-tag">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${c.address || 'Khu Đô Thị Mới, TP. Hồ Chí Minh'}</span>
        </div>
        <div class="amenities-list">
          ${(c.amenities || [])
            .map(
              (am) => `
            <div class="amenity-item">
              <span class="amenity-name">${am.name}</span>
              <span class="amenity-dist">${am.distance}</span>
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

