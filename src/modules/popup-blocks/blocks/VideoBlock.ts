import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';
import { MediaManagerService } from '../../media-manager/core/MediaManagerService';

export interface VideoBlockContent {
  videoUrl: string;
  posterUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  caption?: string;
}

export class VideoBlock extends BaseBlock<VideoBlockContent> {
  constructor(schema: PopupBlockSchema<VideoBlockContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const card = DomUtils.createElement('div', 'block-popup block-video');
    const c = this.schema.content;

    card.innerHTML = `
      <div class="popup-drag-handle">
        <span class="popup-title">${this.schema.title || 'Video Thuyết Minh Kiến Trúc'}</span>
        <button class="btn-change-video" title="Thay đổi video">Đổi Video</button>
      </div>
      <div class="popup-content-body">
        <div class="video-player-wrap">
          <video
            src="${c.videoUrl}"
            ${c.posterUrl ? `poster="${c.posterUrl}"` : ''}
            ${c.autoplay ? 'autoplay' : ''}
            ${c.loop ? 'loop' : ''}
            ${c.muted !== false ? 'muted' : ''}
            playsinline
            controls
            class="popup-video-el"
          ></video>
          <input type="file" accept="video/*" class="vid-file-hidden" style="display:none;" />
        </div>
        ${c.caption ? `<div class="popup-caption">${c.caption}</div>` : ''}
      </div>
    `;

    const btnChange = card.querySelector('.btn-change-video') as HTMLButtonElement;
    const fileInput = card.querySelector('.vid-file-hidden') as HTMLInputElement;

    btnChange?.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput?.click();
    });

    fileInput?.addEventListener('change', async () => {
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const mediaService = MediaManagerService.getInstance(this.emitter);
        const asset = await mediaService.uploadFile(file);
        this.schema.content.videoUrl = asset.url;
        const video = card.querySelector('.popup-video-el') as HTMLVideoElement;
        if (video) video.src = asset.url;
        this.emitter.emit('builder:block-updated', this.schema);
      }
    });

    return card;
  }
}
