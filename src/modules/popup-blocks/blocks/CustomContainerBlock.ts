import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';

export interface CustomContainerContent {
  layoutType?: 'column' | 'row';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  headline?: string;
  subhead?: string;
  bodyText?: string;
  caption?: string;
}

export class CustomContainerBlock extends BaseBlock<CustomContainerContent> {
  constructor(schema: PopupBlockSchema<CustomContainerContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', 'block-popup block-custom-container');
    const c = this.schema.content || {};
    const layout = c.layoutType || 'column';

    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'Container Phối Hợp'}</span>
      </div>
      <div class="popup-content-body container-body layout-${layout}">
        ${c.mediaUrl ? `
          <div class="container-media-wrap">
            ${c.mediaType === 'video' ? `
              <video src="${c.mediaUrl}" class="container-video" autoplay muted loop playsinline></video>
            ` : `
              <img src="${c.mediaUrl}" alt="Architectural visual" class="container-img" loading="lazy" />
            `}
            ${c.caption ? `<div class="container-caption">${c.caption}</div>` : ''}
          </div>
        ` : ''}

        <div class="container-text-wrap">
          ${c.subhead ? `<div class="container-subhead">${c.subhead}</div>` : ''}
          ${c.headline ? `<h4 class="container-headline">${c.headline}</h4>` : ''}
          ${c.bodyText ? `<p class="container-bodytext">${c.bodyText}</p>` : ''}
        </div>
      </div>
    `;

    return card;
  }
}

