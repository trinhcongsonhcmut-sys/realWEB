import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';
import { MediaManagerService } from '../../media-manager/core/MediaManagerService';

export interface ImageBlockContent {
  imageUrl: string;
  alt?: string;
  caption?: string;
  badge?: string;
  sizeType?: 'large' | 'medium' | 'small';
}

export class ImageBlock extends BaseBlock<ImageBlockContent> {
  constructor(schema: PopupBlockSchema<ImageBlockContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', `block-popup block-image size-${this.schema.content.sizeType || 'medium'}`);
    const c = this.schema.content;

    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'Hình Ảnh Kiến Trúc'}</span>
        ${c.badge ? `<span class="popup-badge">${c.badge}</span>` : ''}
      </div>
      <div class="popup-content-body">
        <div class="image-preview-wrapper" title="Kéo thả ảnh hoặc click để đổi">
          <img src="${c.imageUrl}" alt="${c.alt || 'Hình ảnh dự án'}" class="popup-img" loading="lazy" />
          <div class="img-overlay-upload">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Kéo thả ảnh vào đây hoặc click để đổi</span>
            <input type="file" accept="image/*" class="img-file-hidden" style="display:none;" />
          </div>
        </div>
        ${c.caption ? `<div class="popup-caption">${c.caption}</div>` : ''}
      </div>
    `;

    const imgOverlay = card.querySelector('.img-overlay-upload') as HTMLElement;
    const fileInput = card.querySelector('.img-file-hidden') as HTMLInputElement;

    imgOverlay?.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput?.click();
    });

    fileInput?.addEventListener('change', async () => {
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const mediaService = MediaManagerService.getInstance(this.emitter);
        const asset = await mediaService.uploadFile(file);
        this.schema.content.imageUrl = asset.url;
        const img = card.querySelector('.popup-img') as HTMLImageElement;
        if (img) img.src = asset.url;
        this.emitter.emit('builder:block-updated', this.schema);
      }
    });

    return card;
  }
}
