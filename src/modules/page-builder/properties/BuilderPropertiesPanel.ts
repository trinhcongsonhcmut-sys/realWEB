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

      ${blk.type === 'text' ? `
      <div class="prop-group">
        <div class="prop-group-title">Nội Dung & Kiểu Chữ (Typography)</div>
        <div class="prop-row">
          <label>Nội dung văn bản</label>
          <textarea id="prop-text-content" rows="4" class="prop-input" style="resize: vertical; font-family: inherit; line-height: 1.4;">${blk.content.text || ''}</textarea>
        </div>
        <div class="prop-row">
          <label>Phông chữ (Font Family)</label>
          <select id="prop-font-family" class="prop-select">
            <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" ${(blk.content.fontFamily || '').includes('Segoe UI') || !blk.content.fontFamily ? 'selected' : ''}>Hệ thống (Sans-Serif)</option>
            <option value="'Playfair Display', Georgia, serif" ${(blk.content.fontFamily || '').includes('Playfair') ? 'selected' : ''}>Playfair Display (Serif Sang Trọng)</option>
            <option value="'Inter', sans-serif" ${(blk.content.fontFamily || '').includes('Inter') ? 'selected' : ''}>Inter (Hiện Đại / Chuẩn UI)</option>
            <option value="'Montserrat', sans-serif" ${(blk.content.fontFamily || '').includes('Montserrat') ? 'selected' : ''}>Montserrat (Hình Học / Sắc Nét)</option>
            <option value="'Roboto', sans-serif" ${(blk.content.fontFamily || '').includes('Roboto') ? 'selected' : ''}>Roboto (Cân Đối)</option>
            <option value="'Merriweather', Georgia, serif" ${(blk.content.fontFamily || '').includes('Merriweather') ? 'selected' : ''}>Merriweather (Cổ Điển)</option>
            <option value="'Oswald', sans-serif" ${(blk.content.fontFamily || '').includes('Oswald') ? 'selected' : ''}>Oswald (Mạnh Mẽ / Khối)</option>
            <option value="'Courier New', monospace" ${(blk.content.fontFamily || '').includes('Courier') ? 'selected' : ''}>Courier New (Monospace)</option>
          </select>
        </div>
        <div class="prop-row-2">
          <div>
            <label>Cỡ chữ (Size)</label>
            <input type="text" id="prop-font-size" value="${blk.content.fontSize || '16px'}" placeholder="16px, 24px" class="prop-input" />
          </div>
          <div>
            <label>Độ đậm (Weight)</label>
            <select id="prop-font-weight" class="prop-select">
              <option value="300" ${blk.content.fontWeight === '300' ? 'selected' : ''}>Mỏng (Light 300)</option>
              <option value="400" ${!blk.content.fontWeight || blk.content.fontWeight === '400' ? 'selected' : ''}>Bình thường (400)</option>
              <option value="500" ${blk.content.fontWeight === '500' ? 'selected' : ''}>Trung bình (500)</option>
              <option value="600" ${blk.content.fontWeight === '600' ? 'selected' : ''}>Hơi đậm (600)</option>
              <option value="700" ${blk.content.fontWeight === '700' ? 'selected' : ''}>Đậm (Bold 700)</option>
              <option value="800" ${blk.content.fontWeight === '800' ? 'selected' : ''}>Rất đậm (800)</option>
            </select>
          </div>
        </div>
        <div class="prop-row-2">
          <div>
            <label>Căn lề (Align)</label>
            <select id="prop-text-align" class="prop-select">
              <option value="left" ${blk.content.textAlign === 'left' || !blk.content.textAlign ? 'selected' : ''}>Trái</option>
              <option value="center" ${blk.content.textAlign === 'center' ? 'selected' : ''}>Giữa</option>
              <option value="right" ${blk.content.textAlign === 'right' ? 'selected' : ''}>Phải</option>
              <option value="justify" ${blk.content.textAlign === 'justify' ? 'selected' : ''}>Đều 2 bên</option>
            </select>
          </div>
          <div>
            <label>Khoảng cách dòng</label>
            <input type="text" id="prop-line-height" value="${blk.content.lineHeight || '1.6'}" placeholder="1.5, 1.8" class="prop-input" />
          </div>
        </div>
        <div class="prop-row-2">
          <div>
            <label>Màu chữ</label>
            <div style="display:flex; gap:6px; align-items:center;">
              <input type="color" id="prop-text-color-picker" value="${blk.content.textColor && blk.content.textColor.startsWith('#') ? blk.content.textColor : '#ffffff'}" style="width:28px; height:28px; padding:0; border:none; border-radius:4px; cursor:pointer; background:none;" />
              <input type="text" id="prop-text-color" value="${blk.content.textColor || '#ffffff'}" class="prop-input" style="flex:1;" />
            </div>
          </div>
          <div style="display:flex; flex-direction:column; justify-content:center; gap:6px; padding-top:14px;">
            <label class="prop-toggle-label" style="font-size:11px;">
              <input type="checkbox" id="prop-font-italic" ${blk.content.fontStyle === 'italic' ? 'checked' : ''} class="prop-checkbox" />
              <span>Nghiêng (Italic)</span>
            </label>
            <label class="prop-toggle-label" style="font-size:11px;">
              <input type="checkbox" id="prop-text-uppercase" ${blk.content.textTransform === 'uppercase' ? 'checked' : ''} class="prop-checkbox" />
              <span>IN HOA</span>
            </label>
          </div>
        </div>
      </div>
      ` : ''}

      ${blk.type === 'image' ? `
      <div class="prop-group">
        <div class="prop-group-title">Hiển Thị Hình Ảnh</div>
        <div class="prop-row">
          <label>Chế độ khớp khung (Object Fit)</label>
          <select id="prop-object-fit" class="prop-select">
            <option value="cover" ${blk.content.objectFit === 'cover' || !blk.content.objectFit ? 'selected' : ''}>Cover (Lấp đầy toàn khung)</option>
            <option value="contain" ${blk.content.objectFit === 'contain' ? 'selected' : ''}>Contain (Vừa vặn - Giữ nguyên hình)</option>
            <option value="fill" ${blk.content.objectFit === 'fill' ? 'selected' : ''}>Fill (Kéo giãn theo khung)</option>
          </select>
        </div>
      </div>
      ` : ''}

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
        if (id === 'prop-transparentBackground' && el.checked) {
          blk.styling.hideHeader = true;
          const hideHeaderEl = this.element.querySelector('#prop-hideHeader') as HTMLInputElement;
          if (hideHeaderEl) hideHeaderEl.checked = true;
        }
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });
    };

    bindCheck('prop-hideHeader', (v) => (blk.styling.hideHeader = v));
    bindCheck('prop-transparentBackground', (v) => (blk.styling.transparentBackground = v));

    // Typography bindings for Text Block
    if (blk.type === 'text') {
      const textInput = this.element.querySelector('#prop-text-content') as HTMLTextAreaElement;
      textInput?.addEventListener('input', () => {
        blk.content.text = textInput.value;
        this.state.emitter.emit('builder:text-content-changed', { blockId: blk.id, text: textInput.value, source: 'panel' });
      });
      textInput?.addEventListener('change', () => {
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });

      bindVal('prop-font-family', (v) => {
        blk.content.fontFamily = v;
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });
      bindVal('prop-font-size', (v) => {
        blk.content.fontSize = v;
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });
      bindVal('prop-font-weight', (v) => {
        blk.content.fontWeight = v;
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });
      bindVal('prop-text-align', (v) => {
        blk.content.textAlign = v as any;
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });
      bindVal('prop-line-height', (v) => {
        blk.content.lineHeight = v;
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });
      bindVal('prop-text-color', (v) => {
        blk.content.textColor = v;
        const picker = this.element.querySelector('#prop-text-color-picker') as HTMLInputElement;
        if (picker && v.startsWith('#')) picker.value = v;
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });

      const colorPicker = this.element.querySelector('#prop-text-color-picker') as HTMLInputElement;
      colorPicker?.addEventListener('input', () => {
        blk.content.textColor = colorPicker.value;
        const colorInput = this.element.querySelector('#prop-text-color') as HTMLInputElement;
        if (colorInput) colorInput.value = colorPicker.value;
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });
      colorPicker?.addEventListener('change', () => {
        this.state.saveSnapshot();
      });

      const italicEl = this.element.querySelector('#prop-font-italic') as HTMLInputElement;
      italicEl?.addEventListener('change', () => {
        blk.content.fontStyle = italicEl.checked ? 'italic' : 'normal';
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });

      const upperEl = this.element.querySelector('#prop-text-uppercase') as HTMLInputElement;
      upperEl?.addEventListener('change', () => {
        blk.content.textTransform = upperEl.checked ? 'uppercase' : 'none';
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });
    }

    // Image Block bindings
    if (blk.type === 'image') {
      bindVal('prop-object-fit', (v) => {
        blk.content.objectFit = v as any;
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });
    }

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

    this.state.emitter.on('builder:text-content-changed', (data: any) => {
      if (data.source !== 'panel' && this.state.activeBlockId === data.blockId) {
        const textInput = this.element.querySelector('#prop-text-content') as HTMLTextAreaElement;
        if (textInput && textInput.value !== data.text) {
          textInput.value = data.text;
        }
      }
    });
  }
}

