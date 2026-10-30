import { BuilderState } from '../state/BuilderState';
import { MediaLibraryModal } from '../../media-manager/components/MediaLibraryModal';
import { MediaManagerService } from '../../media-manager/core/MediaManagerService';
import { DomUtils } from '../../shared/utils/domUtils';

export class BuilderPropertiesPanel {
  public state: BuilderState;
  public element: HTMLElement;
  private mediaModal: MediaLibraryModal;

  constructor(state: BuilderState) {
    this.state = state;
    this.mediaModal = new MediaLibraryModal(MediaManagerService.getInstance(state.emitter));
    this.element = this.render();
    this.bindEvents();
  }

  private render(): HTMLElement {
    const aside = DomUtils.createElement('aside', 'builder-props-panel');
    aside.innerHTML = `
      <div class="props-header">
        <div class="props-header-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>Properties</span>
        </div>
      </div>
      <div class="props-content" id="props-fields">
        <div class="props-empty-state">Chọn một pop-up trên màn hình để cấu hình thuộc tính</div>
      </div>
    `;
    return aside;
  }

  public updatePanel(): void {
    const fields = this.element.querySelector('#props-fields');
    if (!fields) return;

    const blk = this.state.getActiveBlock();
    if (!blk) {
      fields.innerHTML = `<div class="props-empty-state">Chọn một pop-up trên màn hình để cấu hình thuộc tính</div>`;
      return;
    }

    const l = blk.layout;
    const s = blk.styling;
    const a = blk.animation;

    fields.innerHTML = `
      <div class="prop-group">
        <div class="prop-group-title">Thông Tin Cơ Bản</div>
        <div class="prop-row">
          <label>Tiêu đề</label>
          <input type="text" id="prop-title" value="${blk.title}" class="prop-input" />
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-group-title">Kích Thước & Tỷ Lệ</div>
        <div class="prop-row-2">
          <div>
            <label>Width</label>
            <input type="text" id="prop-width" value="${l.width || 'auto'}" class="prop-input" />
          </div>
          <div>
            <label>Height</label>
            <input type="text" id="prop-height" value="${l.height || 'auto'}" class="prop-input" />
          </div>
        </div>
        <div class="prop-row-2">
          <div>
            <label>Min Width</label>
            <input type="text" id="prop-minWidth" value="${l.minWidth || ''}" placeholder="none" class="prop-input" />
          </div>
          <div>
            <label>Max Width</label>
            <input type="text" id="prop-maxWidth" value="${l.maxWidth || ''}" placeholder="none" class="prop-input" />
          </div>
        </div>
        <div class="prop-row">
          <label>Aspect Ratio</label>
          <input type="text" id="prop-aspectRatio" value="${l.aspectRatio || ''}" placeholder="e.g. 16/9, 4/3, 1" class="prop-input" />
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-group-title">Vị Trí & Tọa Độ (X, Y)</div>
        <div class="prop-row">
          <label>Position</label>
          <select id="prop-position" class="prop-select">
            <option value="relative" ${l.position === 'relative' ? 'selected' : ''}>Relative (Luồng trang)</option>
            <option value="absolute" ${l.position === 'absolute' ? 'selected' : ''}>Absolute (Tọa độ tự do)</option>
            <option value="fixed" ${l.position === 'fixed' ? 'selected' : ''}>Fixed (Cố định màn hình)</option>
          </select>
        </div>
        <div class="prop-row-2">
          <div>
            <label>Tọa độ X</label>
            <input type="text" id="prop-x" value="${l.x || 'center'}" placeholder="left, center, 40px, 10%" class="prop-input" />
          </div>
          <div>
            <label>Tọa độ Y</label>
            <input type="text" id="prop-y" value="${l.y || 'center'}" placeholder="top, center, 100px" class="prop-input" />
          </div>
        </div>
        <div class="prop-row">
          <label>Z-Index (Lớp xếp chồng)</label>
          <input type="number" id="prop-zIndex" value="${l.zIndex ?? 10}" class="prop-input" />
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-group-title">Giao Diện & Kính Mờ (Glassmorphism)</div>
        <div class="prop-toggles-container">
          <label class="prop-toggle-label">
            <input type="checkbox" id="prop-hideHeader" ${s.hideHeader ? 'checked' : ''} class="prop-checkbox" />
            <span class="prop-toggle-text">Tắt tiêu đề Pop-up (Chỉ hiện nội dung)</span>
          </label>
          <label class="prop-toggle-label">
            <input type="checkbox" id="prop-transparentBackground" ${s.transparentBackground ? 'checked' : ''} class="prop-checkbox" />
            <span class="prop-toggle-text">Loại bỏ khung nền (Nền trong suốt)</span>
          </label>
        </div>
        <div class="prop-row">
          <label>Background</label>
          <input type="text" id="prop-background" value="${s.background || 'rgba(18, 21, 28, 0.88)'}" class="prop-input" />
        </div>
        <div class="prop-row-2">
          <div>
            <label>Blur (px)</label>
            <input type="text" id="prop-backdropBlur" value="${s.backdropBlur || '20px'}" class="prop-input" />
          </div>
          <div>
            <label>Bo góc (px)</label>
            <input type="text" id="prop-borderRadius" value="${s.borderRadius || '18px'}" class="prop-input" />
          </div>
        </div>
        <div class="prop-row-2">
          <div>
            <label>Opacity (0-1)</label>
            <input type="number" step="0.1" min="0" max="1" id="prop-opacity" value="${s.opacity ?? 1}" class="prop-input" />
          </div>
          <div>
            <label>Đệm (Padding)</label>
            <input type="text" id="prop-padding" value="${s.padding || '18px'}" class="prop-input" />
          </div>
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-group-title">Hiệu Ứng Chuyển Động (Animation)</div>
        <div class="prop-row">
          <label>Entrance</label>
          <select id="prop-entrance" class="prop-select">
            <option value="fade-up" ${a.entrance === 'fade-up' ? 'selected' : ''}>Fade Up</option>
            <option value="fade-in" ${a.entrance === 'fade-in' ? 'selected' : ''}>Fade In</option>
            <option value="scale-up" ${a.entrance === 'scale-up' ? 'selected' : ''}>Scale Up</option>
            <option value="slide-left" ${a.entrance === 'slide-left' ? 'selected' : ''}>Slide Left</option>
            <option value="slide-right" ${a.entrance === 'slide-right' ? 'selected' : ''}>Slide Right</option>
            <option value="none" ${a.entrance === 'none' ? 'selected' : ''}>None</option>
          </select>
        </div>
        <div class="prop-row-2">
          <div>
            <label>Thời lượng (ms)</label>
            <input type="number" id="prop-animDuration" value="${a.duration || 400}" class="prop-input" />
          </div>
          <div>
            <label>Độ trễ (ms)</label>
            <input type="number" id="prop-animDelay" value="${a.delay || 0}" class="prop-input" />
          </div>
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-group-title">Kho Tài Nguyên & Nội Dung</div>
        <button class="btn-open-media-for-block" id="btn-pick-media">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>Chọn Tệp từ Media Manager</span>
        </button>
      </div>
    `;

    this.bindFieldInputs(blk);
  }

  private bindFieldInputs(blk: any): void {
    const bindVal = (id: string, setter: (val: string) => void) => {
      const el = this.element.querySelector(`#${id}`) as HTMLInputElement;
      el?.addEventListener('change', () => {
        setter(el.value);
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:block-updated', blk);
      });
    };

    bindVal('prop-title', (v) => (blk.title = v));
    bindVal('prop-width', (v) => (blk.layout.width = v));
    bindVal('prop-height', (v) => (blk.layout.height = v));
    bindVal('prop-minWidth', (v) => (blk.layout.minWidth = v));
    bindVal('prop-maxWidth', (v) => (blk.layout.maxWidth = v));
    bindVal('prop-aspectRatio', (v) => (blk.layout.aspectRatio = v));
    bindVal('prop-position', (v) => (blk.layout.position = v as any));
    bindVal('prop-x', (v) => (blk.layout.x = v));
    bindVal('prop-y', (v) => (blk.layout.y = v));
    bindVal('prop-zIndex', (v) => (blk.layout.zIndex = parseInt(v, 10)));
    bindVal('prop-background', (v) => (blk.styling.background = v));
    bindVal('prop-backdropBlur', (v) => (blk.styling.backdropBlur = v));
    bindVal('prop-borderRadius', (v) => (blk.styling.borderRadius = v));
    bindVal('prop-opacity', (v) => (blk.styling.opacity = parseFloat(v)));
    bindVal('prop-padding', (v) => (blk.styling.padding = v));
    bindVal('prop-entrance', (v) => (blk.animation.entrance = v as any));
    bindVal('prop-animDuration', (v) => (blk.animation.duration = parseInt(v, 10)));
    bindVal('prop-animDelay', (v) => (blk.animation.delay = parseInt(v, 10)));

    const bindCheck = (id: string, setter: (val: boolean) => void) => {
      const el = this.element.querySelector(`#${id}`) as HTMLInputElement;
      el?.addEventListener('change', () => {
        setter(el.checked);
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });
    };

    bindCheck('prop-hideHeader', (v) => (blk.styling.hideHeader = v));
    bindCheck('prop-transparentBackground', (v) => (blk.styling.transparentBackground = v));

    // Open media manager to set content URL
    this.element.querySelector('#btn-pick-media')?.addEventListener('click', () => {
      this.mediaModal.open({
        onSelect: (asset) => {
          if (blk.content.imageUrl !== undefined) blk.content.imageUrl = asset.url;
          if (blk.content.videoUrl !== undefined) blk.content.videoUrl = asset.url;
          if (blk.content.modelUrl !== undefined) blk.content.modelUrl = asset.url;
          this.state.saveSnapshot();
          this.state.emitter.emit('builder:page-updated', this.state.page);
        }
      });
    });
  }

  private bindEvents(): void {
    this.state.emitter.on('builder:selection-changed', () => this.updatePanel());
    this.state.emitter.on('builder:page-updated', () => this.updatePanel());

    const updateInputsOnResize = (blk: any) => {
      if (this.state.activeBlockId === blk.id) {
        const wInput = this.element.querySelector('#prop-width') as HTMLInputElement;
        const hInput = this.element.querySelector('#prop-height') as HTMLInputElement;
        const xInput = this.element.querySelector('#prop-x') as HTMLInputElement;
        const yInput = this.element.querySelector('#prop-y') as HTMLInputElement;
        if (wInput && blk.layout.width) wInput.value = blk.layout.width;
        if (hInput && blk.layout.height) hInput.value = blk.layout.height;
        if (xInput && blk.layout.x) xInput.value = blk.layout.x;
        if (yInput && blk.layout.y) yInput.value = blk.layout.y;
      }
    };

    this.state.emitter.on('builder:block-resizing', updateInputsOnResize);
    this.state.emitter.on('builder:block-updated', updateInputsOnResize);
  }
}

