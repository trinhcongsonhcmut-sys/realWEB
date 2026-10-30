import { BuilderState } from '../state/BuilderState';
import { MediaLibraryModal } from '../../media-manager/components/MediaLibraryModal';
import { MediaManagerService } from '../../media-manager/core/MediaManagerService';
import { DomUtils } from '../../shared/utils/domUtils';
import { SectionSchema } from '../../shared/schemas/page.types';

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
        <div class="props-empty-state">Chọn một Section hoặc Pop-up trên màn hình để cấu hình thuộc tính</div>
      </div>
    `;
    return aside;
  }

  public updatePanel(): void {
    const fields = this.element.querySelector('#props-fields');
    if (!fields) return;

    const blk = this.state.getActiveBlock();
    if (!blk) {
      const activeSec = this.state.getActiveSection();
      if (activeSec) {
        this.renderSectionProperties(activeSec, fields as HTMLElement);
        return;
      }
      fields.innerHTML = `<div class="props-empty-state">Chọn một Section hoặc Pop-up trên màn hình để cấu hình thuộc tính</div>`;
      return;
    }

    const l = blk.layout;
    const s = blk.styling;
    const a = blk.animation;
    const activeSec = this.state.getActiveSection();
    const currentSecHex = this.extractHex(activeSec?.layout.background);

    fields.innerHTML = `
      ${activeSec ? `
      <div class="prop-group">
        <div class="prop-group-title">Màu Nền Section (${activeSec.title})</div>
        <div class="rainbow-picker-container">
          <div class="rainbow-swatch-wrap" title="Bấm vào đây để mở bảng màu cầu vồng">
            <input type="color" id="sec-quick-rainbow" value="${currentSecHex}" class="rainbow-native-input" />
            <span class="rainbow-swatch-badge">Bảng màu cầu vồng Section 🎨</span>
          </div>
          <div class="prop-row">
            <input type="text" id="sec-quick-bg-text" value="${activeSec.layout.background || '#0a0d14'}" placeholder="#0a0d14 hoặc gradient" class="prop-input" />
          </div>
          <div class="rainbow-presets-grid">
            <button class="preset-color-dot" data-color="#000000" style="background:#000000;" title="Pure Black"></button>
            <button class="preset-color-dot" data-color="#0a0d14" style="background:#0a0d14;" title="Midnight Dark"></button>
            <button class="preset-color-dot" data-color="#0f172a" style="background:#0f172a;" title="Slate Blue"></button>
            <button class="preset-color-dot" data-color="#111827" style="background:#111827;" title="Charcoal"></button>
            <button class="preset-color-dot" data-color="#042f2e" style="background:#042f2e;" title="Dark Emerald"></button>
            <button class="preset-color-dot" data-color="#1e1b4b" style="background:#1e1b4b;" title="Deep Violet"></button>
            <button class="preset-color-dot" data-color="linear-gradient(180deg, #0a0d14 0%, #111520 100%)" style="background:linear-gradient(180deg, #0a0d14 0%, #111520 100%);" title="Gradient Dark Dual"></button>
            <button class="preset-color-dot" data-color="linear-gradient(180deg, #0a0d14 0%, #0c2135 100%)" style="background:linear-gradient(180deg, #0a0d14 0%, #0c2135 100%);" title="Gradient Cyan Glow"></button>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="prop-group">
        <div class="prop-group-title">Thông Tin Pop-up</div>
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
      </div>

      <div class="prop-group">
        <div class="prop-group-title">Xoay Góc & Tỷ Lệ (Transform)</div>
        <div class="prop-row">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="margin:0;">Góc xoay (Rotate: -180° đến 180°)</label>
            <span id="label-val-rotate" style="font-size:11px; font-weight:700; color:#38bdf8;">${blk.transform?.rotate || 0}°</span>
          </div>
          <input type="range" id="prop-rotate-slider" min="-180" max="180" value="${blk.transform?.rotate || 0}" class="text-font-size-slider" />
        </div>
        <div class="prop-row">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="margin:0;">Tỷ lệ phóng (Scale)</label>
            <span id="label-val-scale" style="font-size:11px; font-weight:700; color:#38bdf8;">${blk.transform?.scale || 1.0}x</span>
          </div>
          <input type="range" id="prop-scale-slider" min="0.5" max="2.0" step="0.05" value="${blk.transform?.scale || 1.0}" class="text-font-size-slider" />
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-group-title">Quản Lý Lớp & Z-Index (Layer)</div>
        <div class="prop-row">
          <label>Z-Index (Lớp hiển thị)</label>
          <input type="number" id="prop-zIndex" value="${l.zIndex ?? 10}" class="prop-input" />
        </div>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px; margin-top:8px;">
          <button type="button" class="btn-width-pill" id="btn-prop-layer-front">⏫ Lên trên cùng</button>
          <button type="button" class="btn-width-pill" id="btn-prop-layer-forward">▲ Lên 1 lớp</button>
          <button type="button" class="btn-width-pill" id="btn-prop-layer-backward">▼ Xuống 1 lớp</button>
          <button type="button" class="btn-width-pill" id="btn-prop-layer-back">⏬ Xuống đáy</button>
        </div>
        <div style="margin-top:10px;">
          <label class="prop-toggle-label">
            <input type="checkbox" id="prop-isLocked" ${blk.locked ? 'checked' : ''} class="prop-checkbox" />
            <span class="prop-toggle-text">🔒 Khóa vị trí (Tránh kéo nhầm)</span>
          </label>
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-group-title">Giao Diện, Đổ Bóng & Bo Góc (Appearance)</div>
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
          <label>Kiểu đổ bóng nghệ thuật (Shadow Presets)</label>
          <select id="prop-shadowPreset" class="prop-select">
            <option value="editorial" ${s.shadowPreset === 'editorial' || !s.shadowPreset ? 'selected' : ''}>Editorial Floating (Tối giản thanh lịch)</option>
            <option value="soft-ambient" ${s.shadowPreset === 'soft-ambient' ? 'selected' : ''}>Soft Ambient (Mềm mại tỏa rộng)</option>
            <option value="deep-floating" ${s.shadowPreset === 'deep-floating' ? 'selected' : ''}>Deep Floating (Chiều sâu kiến trúc)</option>
            <option value="dramatic" ${s.shadowPreset === 'dramatic' ? 'selected' : ''}>Dramatic Horizon (Bóng kịch tính)</option>
            <option value="glow-cyan" ${s.shadowPreset === 'glow-cyan' ? 'selected' : ''}>Cyan Glow (Ánh sáng Cyan)</option>
            <option value="none" ${s.shadowPreset === 'none' ? 'selected' : ''}>None (Không bóng đổ)</option>
          </select>
        </div>

        <div class="prop-row">
          <label>Background Pop-up</label>
          <input type="text" id="prop-background" value="${s.background || 'rgba(18, 21, 28, 0.88)'}" class="prop-input" />
        </div>
        <div class="prop-row-2">
          <div>
            <label>Kính mờ Blur</label>
            <input type="text" id="prop-backdropBlur" value="${s.backdropBlur || '20px'}" placeholder="20px" class="prop-input" />
          </div>
          <div>
            <label>Bo góc chung</label>
            <input type="text" id="prop-borderRadius" value="${s.borderRadius || '18px'}" placeholder="18px" class="prop-input" />
          </div>
        </div>

        <div class="prop-row" style="margin-top:4px;">
          <label style="font-size:11px; color:#94a3b8;">Bo góc độc lập 4 góc (TL, TR, BR, BL):</label>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:4px; margin-top:4px;">
            <input type="text" id="prop-br-tl" value="${s.borderRadiusIndividual?.topLeft || ''}" placeholder="TL" class="prop-input" style="text-align:center; padding:4px;" title="Góc trên-trái" />
            <input type="text" id="prop-br-tr" value="${s.borderRadiusIndividual?.topRight || ''}" placeholder="TR" class="prop-input" style="text-align:center; padding:4px;" title="Góc trên-phải" />
            <input type="text" id="prop-br-br" value="${s.borderRadiusIndividual?.bottomRight || ''}" placeholder="BR" class="prop-input" style="text-align:center; padding:4px;" title="Góc dưới-phải" />
            <input type="text" id="prop-br-bl" value="${s.borderRadiusIndividual?.bottomLeft || ''}" placeholder="BL" class="prop-input" style="text-align:center; padding:4px;" title="Góc dưới-trái" />
          </div>
        </div>

        <div class="prop-row-2">
          <div>
            <label>Độ mờ đục (Opacity)</label>
            <input type="number" step="0.05" min="0" max="1" id="prop-opacity" value="${s.opacity ?? 1}" class="prop-input" />
          </div>
          <div>
            <label>Tràn viền (Overflow)</label>
            <select id="prop-overflow" class="prop-select">
              <option value="hidden" ${s.overflow === 'hidden' || !s.overflow ? 'selected' : ''}>Cắt viền (Hidden)</option>
              <option value="visible" ${s.overflow === 'visible' ? 'selected' : ''}>Tràn viền (Bleed / Visible)</option>
            </select>
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
          <label>Phông chữ (Be Vietnam Pro Chuẩn Quốc Tế & Tiếng Việt)</label>
          <select id="prop-font-family" class="prop-select">
            <option value="'Be Vietnam Pro', sans-serif" selected>Be Vietnam Pro (Chuẩn Quốc Tế & Tiếng Việt Hoàn Hảo)</option>
          </select>
          <div style="font-size:11px; color:#38bdf8; margin-top:4px;">✨ Toàn bộ hệ thống áp dụng độc quyền Be Vietnam Pro sắc nét, không lỗi dấu.</div>
        </div>

        <div class="prop-row-2">
          <div>
            <label>Cỡ chữ (Size: e.g. 18px, 24px)</label>
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
              <option value="900" ${blk.content.fontWeight === '900' ? 'selected' : ''}>Siêu đậm (900)</option>
            </select>
          </div>
        </div>

        <div class="prop-row" style="margin-top:-2px;">
          <input type="range" id="prop-font-size-slider" min="12" max="72" value="${parseInt(blk.content.fontSize || '16', 10) || 16}" class="text-font-size-slider" title="Kéo để đổi cỡ chữ tức thì" />
          <div class="quick-size-pills">
            <span style="font-size:10px; color:#94a3b8; align-self:center; margin-right:2px;">Nhanh:</span>
            <button class="btn-size-pill" data-size="14px">14px</button>
            <button class="btn-size-pill" data-size="18px">18px</button>
            <button class="btn-size-pill" data-size="24px">24px</button>
            <button class="btn-size-pill" data-size="32px">32px</button>
            <button class="btn-size-pill" data-size="44px">44px</button>
            <button class="btn-size-pill" data-size="60px">60px</button>
          </div>
        </div>

        <div class="prop-row">
          <label>Căn lề văn bản (Text Align)</label>
          <div class="prop-align-segmented">
            <button type="button" class="btn-align-pill ${blk.content.textAlign === 'left' || !blk.content.textAlign ? 'active' : ''}" data-align="left" title="Căn lề trái">⬅ Trái</button>
            <button type="button" class="btn-align-pill ${blk.content.textAlign === 'center' ? 'active' : ''}" data-align="center" title="Căn lề giữa">↔ Giữa</button>
            <button type="button" class="btn-align-pill ${blk.content.textAlign === 'right' ? 'active' : ''}" data-align="right" title="Căn lề phải">➡ Phải</button>
            <button type="button" class="btn-align-pill ${blk.content.textAlign === 'justify' ? 'active' : ''}" data-align="justify" title="Căn đều 2 bên">☰ Căn đều 2 bên</button>
          </div>
          <select id="prop-text-align" class="prop-select" style="display:none;">
            <option value="left" ${blk.content.textAlign === 'left' || !blk.content.textAlign ? 'selected' : ''}>Trái</option>
            <option value="center" ${blk.content.textAlign === 'center' ? 'selected' : ''}>Giữa</option>
            <option value="right" ${blk.content.textAlign === 'right' ? 'selected' : ''}>Phải</option>
            <option value="justify" ${blk.content.textAlign === 'justify' ? 'selected' : ''}>Đều 2 bên</option>
          </select>
        </div>

        <div class="prop-row">
          <label>Khoảng cách dòng (Line Height)</label>
          <input type="text" id="prop-line-height" value="${blk.content.lineHeight || '1.6'}" placeholder="1.5, 1.8" class="prop-input" />
        </div>

        <div class="prop-row">
          <label>Màu chữ (Bảng màu full)</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <input type="color" id="prop-text-color-picker" value="${this.extractHex(blk.content.textColor)}" style="width:34px; height:34px; padding:0; border:none; border-radius:6px; cursor:pointer; background:none; flex-shrink:0;" title="Bấm chọn màu cầu vồng" />
            <input type="text" id="prop-text-color" value="${blk.content.textColor || '#ffffff'}" placeholder="#ffffff" class="prop-input" style="flex:1;" />
          </div>
          <div class="text-color-presets-row">
            <span style="font-size:10px; color:#94a3b8; margin-right:2px;">Gợi ý:</span>
            <button class="btn-text-color-dot" data-color="#ffffff" style="background:#ffffff;" title="Trắng"></button>
            <button class="btn-text-color-dot" data-color="#f1f5f9" style="background:#f1f5f9;" title="Trắng sáng"></button>
            <button class="btn-text-color-dot" data-color="#38bdf8" style="background:#38bdf8;" title="Xanh Cyan"></button>
            <button class="btn-text-color-dot" data-color="#f59e0b" style="background:#f59e0b;" title="Vàng Gold"></button>
            <button class="btn-text-color-dot" data-color="#ef4444" style="background:#ef4444;" title="Đỏ"></button>
            <button class="btn-text-color-dot" data-color="#10b981" style="background:#10b981;" title="Xanh Emerald"></button>
            <button class="btn-text-color-dot" data-color="#a855f7" style="background:#a855f7;" title="Tím"></button>
            <button class="btn-text-color-dot" data-color="#94a3b8" style="background:#94a3b8;" title="Xám Slate"></button>
          </div>
        </div>

        <div class="prop-row-2" style="margin-top:6px;">
          <label class="prop-toggle-label" style="font-size:12px;">
            <input type="checkbox" id="prop-font-italic" ${blk.content.fontStyle === 'italic' ? 'checked' : ''} class="prop-checkbox" />
            <span>Nghiêng (Italic)</span>
          </label>
          <label class="prop-toggle-label" style="font-size:12px;">
            <input type="checkbox" id="prop-text-uppercase" ${blk.content.textTransform === 'uppercase' ? 'checked' : ''} class="prop-checkbox" />
            <span>IN HOA</span>
          </label>
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
        <div class="prop-group-title">Hiệu Ứng & Parallax Đa Vận Tốc</div>
        <div class="prop-row">
          <label>Entrance</label>
          <select id="prop-entrance" class="prop-select">
            <option value="fade-up" ${a.entrance === 'fade-up' ? 'selected' : ''}>Fade Up (Trượt lên)</option>
            <option value="fade-in" ${a.entrance === 'fade-in' ? 'selected' : ''}>Fade In (Hiện dần)</option>
            <option value="scale-up" ${a.entrance === 'scale-up' ? 'selected' : ''}>Scale Up (Phóng to)</option>
            <option value="slide-left" ${a.entrance === 'slide-left' ? 'selected' : ''}>Slide Left (Từ trái)</option>
            <option value="slide-right" ${a.entrance === 'slide-right' ? 'selected' : ''}>Slide Right (Từ phải)</option>
            <option value="none" ${a.entrance === 'none' ? 'selected' : ''}>None (Tức thì)</option>
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

        <div class="prop-row">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="margin:0;">Vận tốc Parallax khi cuộn (-0.5 đến +0.8)</label>
            <span id="label-val-parallax" style="font-size:11px; font-weight:700; color:#38bdf8;">${a.parallaxSpeed || 0}</span>
          </div>
          <input type="range" id="prop-parallax-slider" min="-0.5" max="0.8" step="0.05" value="${a.parallaxSpeed || 0}" class="text-font-size-slider" />
          <div style="font-size:10.5px; color:#64748b; margin-top:4px; line-height:1.4;">
            💡 <strong>Hiệu ứng thị sai (3D Optical Depth):</strong> Cho phép popup này di chuyển nhanh hơn hoặc chậm hơn ảnh nền khi cuộn chuột.
          </div>
        </div>
      </div>

      ${blk.type === 'info-card' ? `
      <div class="prop-group">
        <div class="prop-group-title">Nội Dung Thẻ Thông Tin (Info Card)</div>
        <div class="prop-row">
          <label>Nhãn phụ / Tagline</label>
          <input type="text" id="prop-infocard-tagline" value="${blk.content.tagline || ''}" placeholder="e.g. RESIDENTIAL SUITE • VILLA 08" class="prop-input" />
        </div>
        <div class="prop-row">
          <label>Tên phòng / Dự án</label>
          <input type="text" id="prop-infocard-title" value="${blk.content.title || ''}" placeholder="e.g. Villa Horizon Sanctuary" class="prop-input" />
        </div>
        <div class="prop-row">
          <label>Đoạn mô tả ngắn</label>
          <textarea id="prop-infocard-desc" rows="3" class="prop-input" style="resize:vertical;">${blk.content.description || ''}</textarea>
        </div>
        <div class="prop-row">
          <label>Mức giá hiển thị</label>
          <input type="text" id="prop-infocard-price" value="${blk.content.price || ''}" placeholder="e.g. 45 Tỷ VNĐ" class="prop-input" />
        </div>
        <div class="prop-row">
          <label>Chữ trên nút CTA</label>
          <input type="text" id="prop-infocard-ctaText" value="${blk.content.ctaText || ''}" placeholder="e.g. ĐẶT LỊCH THAM QUAN" class="prop-input" />
        </div>
      </div>
      ` : ''}

      ${blk.type === 'container' ? `
      <div class="prop-group">
        <div class="prop-group-title">Cấu Hình Custom Container</div>
        <div class="prop-row">
          <label>Bố cục hiển thị (Layout)</label>
          <select id="prop-container-layout" class="prop-select">
            <option value="column" ${blk.content.layoutType === 'column' || !blk.content.layoutType ? 'selected' : ''}>Dọc (Ảnh trên - Chữ dưới)</option>
            <option value="row" ${blk.content.layoutType === 'row' ? 'selected' : ''}>Ngang (Ảnh trái - Chữ phải)</option>
          </select>
        </div>
        <div class="prop-row">
          <label>Tiêu đề phụ (Subhead)</label>
          <input type="text" id="prop-container-subhead" value="${blk.content.subhead || ''}" placeholder="e.g. KIẾN TRÚC & ÁNH SÁNG" class="prop-input" />
        </div>
        <div class="prop-row">
          <label>Tiêu đề chính (Headline)</label>
          <input type="text" id="prop-container-headline" value="${blk.content.headline || ''}" placeholder="e.g. Tuyệt tác kiến trúc..." class="prop-input" />
        </div>
        <div class="prop-row">
          <label>Nội dung chi tiết</label>
          <textarea id="prop-container-bodytext" rows="3" class="prop-input" style="resize:vertical;">${blk.content.bodyText || ''}</textarea>
        </div>
      </div>
      ` : ''}

      ${blk.type === 'hero-video' ? `
      <div class="prop-group">
        <div class="prop-group-title">Cấu Hình Video Lăn Chuột (Hero Video)</div>
        <div class="prop-row">
          <label>Chế độ nguồn video</label>
          <select id="prop-hero-video-mode" class="prop-select">
            <option value="manifest" ${!blk.content.videoUrl ? 'selected' : ''}>Chuỗi WebP Frames (Tối ưu 60fps mượt nhất)</option>
            <option value="video" ${blk.content.videoUrl ? 'selected' : ''}>Tệp Video MP4 / WebM Trực Tiếp</option>
          </select>
        </div>
        <div class="prop-row" id="row-hero-manifest" style="${blk.content.videoUrl ? 'display:none;' : ''}">
          <label>Đường dẫn Manifest JSON (Khung hình)</label>
          <input type="text" id="prop-hero-manifest" value="${blk.content.manifestUrl || '/assets/frames/manifest.json'}" placeholder="/assets/frames/manifest.json" class="prop-input" />
        </div>
        <div class="prop-row" id="row-hero-videourl" style="${!blk.content.videoUrl ? 'display:none;' : ''}">
          <label>Đường dẫn tệp Video (.mp4 / .webm)</label>
          <input type="text" id="prop-hero-videourl-input" value="${blk.content.videoUrl || ''}" placeholder="/assets/videos/... hoặc URL video" class="prop-input" />
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button type="button" class="btn-open-media-for-block" id="btn-hero-pick-video" style="flex:1;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <span>Chọn Video / Manifest từ Media</span>
          </button>
        </div>
        <div style="font-size:11px; color:#38bdf8; margin-top:8px; line-height:1.4;">
          💡 <strong>Hướng dẫn thêm video mới:</strong> Tải tệp MP4 của bạn vào Media Manager và chọn ở đây; hoặc dùng chuỗi WebP frames trích xuất sẵn để cuộn mượt từng mili-giây.
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

    this.bindFieldInputs(blk, activeSec);
  }

  private renderSectionProperties(sec: SectionSchema, container: HTMLElement): void {
    const currentHex = this.extractHex(sec.layout.background);

    container.innerHTML = `
      <div class="prop-group">
        <div class="prop-group-title">Cấu Hình Section ${sec.order}</div>
        <div class="prop-row">
          <label>Tên Section</label>
          <input type="text" id="sec-prop-title" value="${sec.title}" class="prop-input" />
        </div>
        <div class="prop-row">
          <label>Loại Section</label>
          <select id="sec-prop-type" class="prop-select">
            <option value="full-screen" ${sec.type === 'full-screen' ? 'selected' : ''}>Full Screen (100vh)</option>
            <option value="half-screen" ${sec.type === 'half-screen' ? 'selected' : ''}>Half Screen (50vh)</option>
            <option value="custom" ${sec.type === 'custom' ? 'selected' : ''}>Tùy chỉnh độ cao</option>
            <option value="sticky" ${sec.type === 'sticky' ? 'selected' : ''}>Sticky (Dính cố định)</option>
          </select>
        </div>
        <div class="prop-row">
          <label>Chiều cao (Height)</label>
          <input type="text" id="sec-prop-height" value="${sec.layout.height || '100vh'}" placeholder="100vh, 650px..." class="prop-input" />
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-group-title">Kích Thước & Chiều Rộng Section</div>
        <div class="prop-row-2">
          <div>
            <label>Chiều rộng (Width)</label>
            <input type="text" id="sec-prop-width" value="${sec.layout.width || '100%'}" placeholder="100%, 1440px..." class="prop-input" />
          </div>
          <div>
            <label>Tối đa (Max Width)</label>
            <input type="text" id="sec-prop-maxWidth" value="${sec.layout.maxWidth || 'none'}" placeholder="none, 1440px..." class="prop-input" />
          </div>
        </div>
        <div class="section-width-presets">
          <span style="font-size:10px; color:#94a3b8; align-self:center; margin-right:4px;">Cài đặt nhanh:</span>
          <button type="button" class="btn-width-pill" data-width="100%" data-maxwidth="none">100% (Full)</button>
          <button type="button" class="btn-width-pill" data-width="100%" data-maxwidth="1440px">1440px (Laptop)</button>
          <button type="button" class="btn-width-pill" data-width="100%" data-maxwidth="1200px">1200px (Desktop)</button>
          <button type="button" class="btn-width-pill" data-width="1000px" data-maxwidth="1000px">1000px (Gọn)</button>
        </div>
        <div style="font-size:11px; color:#64748b; margin-top:6px;">
          Khi giới hạn chiều rộng, section sẽ tự động căn giữa màn hình tuyệt đẹp.
        </div>
      </div>

      <div class="prop-group">
        <div class="prop-group-title">Màu Nền Section (Bảng Màu Cầu Vồng Full)</div>
        <div class="rainbow-picker-container">
          <div class="rainbow-swatch-wrap" title="Bấm vào đây để chọn màu cầu vồng">
            <input type="color" id="sec-rainbow-picker" value="${currentHex}" class="rainbow-native-input" />
            <span class="rainbow-swatch-badge">Bấm để chọn màu cầu vồng full 🎨</span>
          </div>
          <div class="prop-row">
            <label>Mã màu / CSS Gradient</label>
            <input type="text" id="sec-bg-input" value="${sec.layout.background || '#0a0d14'}" placeholder="#0a0d14 hoặc gradient" class="prop-input" />
          </div>
        </div>

        <div style="font-size:11px; color:#94a3b8; margin-top:8px;">Bảng màu gợi ý nhanh:</div>
        <div class="rainbow-presets-grid">
          <button class="preset-color-dot" data-color="#000000" style="background:#000000;" title="Pure Black"></button>
          <button class="preset-color-dot" data-color="#0a0d14" style="background:#0a0d14;" title="Midnight Dark"></button>
          <button class="preset-color-dot" data-color="#0f172a" style="background:#0f172a;" title="Slate Blue"></button>
          <button class="preset-color-dot" data-color="#111827" style="background:#111827;" title="Charcoal"></button>
          <button class="preset-color-dot" data-color="#042f2e" style="background:#042f2e;" title="Dark Emerald"></button>
          <button class="preset-color-dot" data-color="#1e1b4b" style="background:#1e1b4b;" title="Deep Violet"></button>
          <button class="preset-color-dot" data-color="linear-gradient(180deg, #0a0d14 0%, #111520 100%)" style="background:linear-gradient(180deg, #0a0d14 0%, #111520 100%);" title="Gradient Dark Dual"></button>
          <button class="preset-color-dot" data-color="linear-gradient(180deg, #0a0d14 0%, #0c2135 100%)" style="background:linear-gradient(180deg, #0a0d14 0%, #0c2135 100%);" title="Gradient Cyan Glow"></button>
        </div>
      </div>
    `;

    this.bindSectionInputs(sec);
  }

  private bindSectionInputs(sec: SectionSchema): void {
    const titleInput = this.element.querySelector('#sec-prop-title') as HTMLInputElement;
    titleInput?.addEventListener('change', () => {
      sec.title = titleInput.value;
      this.state.saveSnapshot();
      this.state.emitter.emit('builder:page-updated', this.state.page);
    });

    const typeSelect = this.element.querySelector('#sec-prop-type') as HTMLSelectElement;
    typeSelect?.addEventListener('change', () => {
      sec.type = typeSelect.value as any;
      if (sec.type === 'full-screen') sec.layout.height = '100vh';
      else if (sec.type === 'half-screen') sec.layout.height = '50vh';
      this.state.saveSnapshot();
      this.state.emitter.emit('builder:page-updated', this.state.page);
    });

    const heightInput = this.element.querySelector('#sec-prop-height') as HTMLInputElement;
    heightInput?.addEventListener('change', () => {
      sec.layout.height = heightInput.value;
      this.state.saveSnapshot();
      this.state.emitter.emit('builder:page-updated', this.state.page);
    });

    // Section Width & Max-Width
    const widthInput = this.element.querySelector('#sec-prop-width') as HTMLInputElement;
    const maxWidthInput = this.element.querySelector('#sec-prop-maxWidth') as HTMLInputElement;

    const applySectionDimensions = (save = false) => {
      sec.layout.width = (widthInput?.value || '100%').trim();
      sec.layout.maxWidth = (maxWidthInput?.value || 'none').trim();
      const secEls = document.querySelectorAll<HTMLElement>(`[data-section-id="${sec.id}"]`);
      secEls.forEach((secEl) => {
        secEl.style.width = sec.layout.width || '';
        secEl.style.maxWidth = sec.layout.maxWidth || '';
        if ((sec.layout.width && sec.layout.width !== '100%') || (sec.layout.maxWidth && sec.layout.maxWidth !== 'none' && sec.layout.maxWidth !== '100%')) {
          secEl.style.marginLeft = 'auto';
          secEl.style.marginRight = 'auto';
        } else {
          secEl.style.marginLeft = '';
          secEl.style.marginRight = '';
        }
      });
      if (save) {
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:page-updated', this.state.page);
      }
    };

    widthInput?.addEventListener('input', () => applySectionDimensions(false));
    widthInput?.addEventListener('change', () => applySectionDimensions(true));
    maxWidthInput?.addEventListener('input', () => applySectionDimensions(false));
    maxWidthInput?.addEventListener('change', () => applySectionDimensions(true));

    this.element.querySelectorAll('.btn-width-pill').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        const w = target.dataset.width || '100%';
        const mw = target.dataset.maxwidth || 'none';
        if (widthInput) widthInput.value = w;
        if (maxWidthInput) maxWidthInput.value = mw;
        applySectionDimensions(true);
      });
    });

    const applySecColor = (colorVal: string) => {
      sec.layout.background = colorVal;
      const secEl = document.querySelector(`[data-section-id="${sec.id}"]`) as HTMLElement;
      if (secEl) {
        secEl.style.background = colorVal;
        const innerSec = secEl.querySelector('.page-section') as HTMLElement;
        if (innerSec) innerSec.style.background = colorVal;
      }
      this.state.emitter.emit('builder:section-bg-changed', { sectionId: sec.id, background: colorVal });
    };

    const rainbowPicker = this.element.querySelector('#sec-rainbow-picker') as HTMLInputElement;
    const bgInput = this.element.querySelector('#sec-bg-input') as HTMLInputElement;

    rainbowPicker?.addEventListener('input', () => {
      const col = rainbowPicker.value;
      if (bgInput) bgInput.value = col;
      applySecColor(col);
    });
    rainbowPicker?.addEventListener('change', () => {
      this.state.saveSnapshot();
    });

    bgInput?.addEventListener('input', () => {
      const col = bgInput.value;
      applySecColor(col);
      if (rainbowPicker && col.startsWith('#') && (col.length === 7 || col.length === 4)) {
        rainbowPicker.value = col;
      }
    });
    bgInput?.addEventListener('change', () => {
      this.state.saveSnapshot();
    });

    this.element.querySelectorAll('.preset-color-dot').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const dotColor = (e.currentTarget as HTMLElement).dataset.color || '#0a0d14';
        if (bgInput) bgInput.value = dotColor;
        if (rainbowPicker && dotColor.startsWith('#') && (dotColor.length === 7 || dotColor.length === 4)) {
          rainbowPicker.value = dotColor;
        }
        applySecColor(dotColor);
        this.state.saveSnapshot();
      });
    });
  }

  private bindFieldInputs(blk: any, activeSec?: SectionSchema | null): void {
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
    bindVal('prop-overflow', (v) => (blk.styling.overflow = v as any));
    bindVal('prop-entrance', (v) => (blk.animation.entrance = v as any));
    bindVal('prop-animDuration', (v) => (blk.animation.duration = parseInt(v, 10)));
    bindVal('prop-animDelay', (v) => (blk.animation.delay = parseInt(v, 10)));

    // Shadow Presets
    const shadowSelect = this.element.querySelector('#prop-shadowPreset') as HTMLSelectElement;
    shadowSelect?.addEventListener('change', () => {
      blk.styling.shadowPreset = shadowSelect.value as any;
      const blockEl = document.querySelector(`[data-block-id="${blk.id}"]`) as HTMLElement;
      if (blockEl) {
        const presetShadows: Record<string, string> = {
          'none': 'none',
          'editorial': '0 20px 40px -15px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.15)',
          'soft-ambient': '0 30px 60px rgba(0,0,0,0.35), 0 12px 24px rgba(0,0,0,0.2)',
          'deep-floating': '0 35px 80px rgba(0,0,0,0.7), 0 15px 35px rgba(0,0,0,0.45)',
          'dramatic': '0 50px 100px -20px rgba(0,0,0,0.85), 0 30px 60px -30px rgba(0,0,0,0.9)',
          'glow-cyan': '0 20px 50px rgba(56, 189, 248, 0.25), 0 0 25px rgba(56, 189, 248, 0.15)'
        };
        blockEl.style.boxShadow = presetShadows[shadowSelect.value] || 'none';
      }
      this.state.saveSnapshot();
      this.state.emitter.emit('builder:block-updated', blk);
    });

    // Rotation & Scale Sliders
    const rotSlider = this.element.querySelector('#prop-rotate-slider') as HTMLInputElement;
    const rotLabel = this.element.querySelector('#label-val-rotate');
    rotSlider?.addEventListener('input', () => {
      const deg = parseInt(rotSlider.value, 10);
      if (!blk.transform) blk.transform = {};
      blk.transform.rotate = deg;
      if (rotLabel) rotLabel.textContent = `${deg}°`;
      const blockEl = document.querySelector(`[data-block-id="${blk.id}"]`) as HTMLElement;
      if (blockEl) {
        const transform = blockEl.style.transform || '';
        const withoutRotate = transform.replace(/rotate\([^)]+\)/g, '').trim();
        blockEl.style.transform = `${withoutRotate} rotate(${deg}deg)`.trim();
      }
    });
    rotSlider?.addEventListener('change', () => {
      this.state.saveSnapshot();
      this.state.emitter.emit('builder:block-updated', blk);
    });

    const scaleSlider = this.element.querySelector('#prop-scale-slider') as HTMLInputElement;
    const scaleLabel = this.element.querySelector('#label-val-scale');
    scaleSlider?.addEventListener('input', () => {
      const sc = parseFloat(scaleSlider.value);
      if (!blk.transform) blk.transform = {};
      blk.transform.scale = sc;
      if (scaleLabel) scaleLabel.textContent = `${sc}x`;
      const blockEl = document.querySelector(`[data-block-id="${blk.id}"]`) as HTMLElement;
      if (blockEl) {
        const transform = blockEl.style.transform || '';
        const withoutScale = transform.replace(/scale\([^)]+\)/g, '').trim();
        blockEl.style.transform = `${withoutScale} scale(${sc})`.trim();
      }
    });
    scaleSlider?.addEventListener('change', () => {
      this.state.saveSnapshot();
      this.state.emitter.emit('builder:block-updated', blk);
    });

    // Layer action buttons in Inspector
    this.element.querySelector('#btn-prop-layer-front')?.addEventListener('click', () => this.state.bringToFront(blk.id));
    this.element.querySelector('#btn-prop-layer-forward')?.addEventListener('click', () => this.state.moveForward(blk.id));
    this.element.querySelector('#btn-prop-layer-backward')?.addEventListener('click', () => this.state.moveBackward(blk.id));
    this.element.querySelector('#btn-prop-layer-back')?.addEventListener('click', () => this.state.sendToBack(blk.id));

    // Lock element
    const lockBox = this.element.querySelector('#prop-isLocked') as HTMLInputElement;
    lockBox?.addEventListener('change', () => {
      blk.locked = lockBox.checked;
      this.state.saveSnapshot();
      this.state.emitter.emit('builder:page-updated', this.state.page);
    });

    // 4 Corners Border Radius
    const bindRadiusCorner = (id: string, corner: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft') => {
      const inp = this.element.querySelector(`#${id}`) as HTMLInputElement;
      inp?.addEventListener('change', () => {
        if (!blk.styling.borderRadiusIndividual) blk.styling.borderRadiusIndividual = {};
        blk.styling.borderRadiusIndividual[corner] = inp.value.trim();
        const blockEl = document.querySelector(`[data-block-id="${blk.id}"]`) as HTMLElement;
        if (blockEl) {
          if (corner === 'topLeft') blockEl.style.borderTopLeftRadius = inp.value.trim();
          if (corner === 'topRight') blockEl.style.borderTopRightRadius = inp.value.trim();
          if (corner === 'bottomRight') blockEl.style.borderBottomRightRadius = inp.value.trim();
          if (corner === 'bottomLeft') blockEl.style.borderBottomLeftRadius = inp.value.trim();
        }
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:block-updated', blk);
      });
    };
    bindRadiusCorner('prop-br-tl', 'topLeft');
    bindRadiusCorner('prop-br-tr', 'topRight');
    bindRadiusCorner('prop-br-br', 'bottomRight');
    bindRadiusCorner('prop-br-bl', 'bottomLeft');

    // Multi-speed Parallax slider
    const plxSlider = this.element.querySelector('#prop-parallax-slider') as HTMLInputElement;
    const plxLabel = this.element.querySelector('#label-val-parallax');
    plxSlider?.addEventListener('input', () => {
      const spd = parseFloat(plxSlider.value);
      blk.animation.parallaxSpeed = spd;
      if (plxLabel) plxLabel.textContent = String(spd);
      const blockEl = document.querySelector(`[data-block-id="${blk.id}"]`) as HTMLElement;
      if (blockEl) blockEl.dataset.parallaxSpeed = String(spd);
    });
    plxSlider?.addEventListener('change', () => {
      this.state.saveSnapshot();
      this.state.emitter.emit('builder:block-updated', blk);
    });

    // Info Card Bindings
    if (blk.type === 'info-card') {
      bindVal('prop-infocard-tagline', (v) => (blk.content.tagline = v));
      bindVal('prop-infocard-title', (v) => (blk.content.title = v));
      bindVal('prop-infocard-desc', (v) => (blk.content.description = v));
      bindVal('prop-infocard-price', (v) => (blk.content.price = v));
      bindVal('prop-infocard-ctaText', (v) => (blk.content.ctaText = v));
    }

    // Container Bindings
    if (blk.type === 'container') {
      bindVal('prop-container-layout', (v) => (blk.content.layoutType = v as any));
      bindVal('prop-container-subhead', (v) => (blk.content.subhead = v));
      bindVal('prop-container-headline', (v) => (blk.content.headline = v));
      bindVal('prop-container-bodytext', (v) => (blk.content.bodyText = v));
    }

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

    // Section quick color picker when block is selected
    if (activeSec) {
      const quickSecPicker = this.element.querySelector('#sec-quick-rainbow') as HTMLInputElement;
      const quickSecText = this.element.querySelector('#sec-quick-bg-text') as HTMLInputElement;

      const applyQuickSec = (col: string) => {
        activeSec.layout.background = col;
        const secEl = document.querySelector(`[data-section-id="${activeSec.id}"]`) as HTMLElement;
        if (secEl) {
          secEl.style.background = col;
          const innerSec = secEl.querySelector('.page-section') as HTMLElement;
          if (innerSec) innerSec.style.background = col;
        }
        this.state.emitter.emit('builder:section-bg-changed', { sectionId: activeSec.id, background: col });
      };

      quickSecPicker?.addEventListener('input', () => {
        const col = quickSecPicker.value;
        if (quickSecText) quickSecText.value = col;
        applyQuickSec(col);
      });
      quickSecPicker?.addEventListener('change', () => {
        this.state.saveSnapshot();
      });

      quickSecText?.addEventListener('input', () => {
        const col = quickSecText.value;
        applyQuickSec(col);
        if (quickSecPicker && col.startsWith('#') && (col.length === 7 || col.length === 4)) {
          quickSecPicker.value = col;
        }
      });
      quickSecText?.addEventListener('change', () => {
        this.state.saveSnapshot();
      });

      this.element.querySelectorAll('.preset-color-dot').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const dotColor = (e.currentTarget as HTMLElement).dataset.color || '#0a0d14';
          if (quickSecText) quickSecText.value = dotColor;
          if (quickSecPicker && dotColor.startsWith('#') && (dotColor.length === 7 || dotColor.length === 4)) {
            quickSecPicker.value = dotColor;
          }
          applyQuickSec(dotColor);
          this.state.saveSnapshot();
        });
      });
    }

    // Direct Typography live bindings for Text Block
    if (blk.type === 'text') {
      const normalizeFontSize = (v: string): string => {
        const trimmed = (v || '').trim();
        if (!trimmed) return '16px';
        if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
        return trimmed;
      };

      const parsePxNumber = (v: string): number => {
        const num = parseInt(v, 10);
        return isNaN(num) ? 16 : num;
      };

      // Comprehensive style application that updates DOM immediately, fires event bus, and updates schema
      const applyLiveStyle = (propName: string, cssProp: string, val: string) => {
        (blk.content as any)[propName] = val;

        // 1. Direct query across all possible DOM locations on canvas
        const elements = document.querySelectorAll<HTMLElement>(
          `.builder-canvas-area .pure-text-content[data-block-id="${blk.id}"], .builder-canvas-area [data-block-id="${blk.id}"] .pure-text-content, [data-block-id="${blk.id}"] .pure-text-content, .pure-text-content[data-block-id="${blk.id}"]`
        );
        elements.forEach((el) => {
          (el.style as any)[cssProp] = val;
        });

        // 2. Broadcast to TextBlock instance listener
        this.state.emitter.emit('builder:text-style-changed', {
          blockId: blk.id,
          styles: { [propName]: val }
        });
      };

      // 1. Text Content
      const textInput = this.element.querySelector('#prop-text-content') as HTMLTextAreaElement;
      textInput?.addEventListener('input', () => {
        blk.content.text = textInput.value;
        const elements = document.querySelectorAll<HTMLElement>(
          `.builder-canvas-area .pure-text-content[data-block-id="${blk.id}"], .builder-canvas-area [data-block-id="${blk.id}"] .pure-text-content, [data-block-id="${blk.id}"] .pure-text-content`
        );
        elements.forEach((el) => {
          if (el.innerText !== textInput.value) el.innerText = textInput.value;
        });
        this.state.emitter.emit('builder:text-content-changed', { blockId: blk.id, text: textInput.value, source: 'panel' });
      });
      textInput?.addEventListener('change', () => {
        this.state.saveSnapshot();
      });

      // 2. Font Family
      const fontFamEl = this.element.querySelector('#prop-font-family') as HTMLSelectElement;
      fontFamEl?.addEventListener('change', () => {
        applyLiveStyle('fontFamily', 'fontFamily', fontFamEl.value);
        this.state.saveSnapshot();
      });

      // 3. Font Size Controls (Input Text, Range Slider & Quick Pills)
      const fontSizeInput = this.element.querySelector('#prop-font-size') as HTMLInputElement;
      const fontSizeSlider = this.element.querySelector('#prop-font-size-slider') as HTMLInputElement;

      const setFontSize = (sizeStr: string, saveSnap = true) => {
        const normalized = normalizeFontSize(sizeStr);
        if (fontSizeInput && fontSizeInput.value !== normalized) fontSizeInput.value = normalized;
        if (fontSizeSlider) fontSizeSlider.value = String(parsePxNumber(normalized));
        applyLiveStyle('fontSize', 'fontSize', normalized);
        if (saveSnap) this.state.saveSnapshot();
      };

      fontSizeInput?.addEventListener('input', () => {
        setFontSize(fontSizeInput.value, false);
      });
      fontSizeInput?.addEventListener('change', () => {
        setFontSize(fontSizeInput.value, true);
      });

      fontSizeSlider?.addEventListener('input', () => {
        setFontSize(`${fontSizeSlider.value}px`, false);
      });
      fontSizeSlider?.addEventListener('change', () => {
        setFontSize(`${fontSizeSlider.value}px`, true);
      });

      this.element.querySelectorAll('.btn-size-pill').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const sz = (e.currentTarget as HTMLElement).dataset.size || '16px';
          setFontSize(sz, true);
        });
      });

      // 4. Font Weight
      const fontWeightEl = this.element.querySelector('#prop-font-weight') as HTMLSelectElement;
      fontWeightEl?.addEventListener('change', () => {
        applyLiveStyle('fontWeight', 'fontWeight', fontWeightEl.value);
        this.state.saveSnapshot();
      });

      // 5. Text Align & Justify
      const textAlignEl = this.element.querySelector('#prop-text-align') as HTMLSelectElement;
      const alignBtns = this.element.querySelectorAll('.btn-align-pill');

      const setTextAlign = (alignVal: string, saveSnap = true) => {
        if (textAlignEl && textAlignEl.value !== alignVal) textAlignEl.value = alignVal;
        alignBtns.forEach((btn) => {
          if ((btn as HTMLElement).dataset.align === alignVal) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
        applyLiveStyle('textAlign', 'textAlign', alignVal);
        if (alignVal === 'justify') {
          applyLiveStyle('textJustify', 'textJustify', 'inter-word');
        } else {
          applyLiveStyle('textJustify', 'textJustify', '');
        }
        if (saveSnap) this.state.saveSnapshot();
      };

      textAlignEl?.addEventListener('change', () => {
        setTextAlign(textAlignEl.value, true);
      });

      alignBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const align = (e.currentTarget as HTMLElement).dataset.align || 'left';
          setTextAlign(align, true);
        });
      });

      // 6. Line Height
      const lineHgtEl = this.element.querySelector('#prop-line-height') as HTMLInputElement;
      lineHgtEl?.addEventListener('input', () => {
        applyLiveStyle('lineHeight', 'lineHeight', lineHgtEl.value);
      });
      lineHgtEl?.addEventListener('change', () => {
        this.state.saveSnapshot();
      });

      // 7. Text Color (Color Picker, Text Input & Color Dots)
      const colorPicker = this.element.querySelector('#prop-text-color-picker') as HTMLInputElement;
      const colorInput = this.element.querySelector('#prop-text-color') as HTMLInputElement;

      const setTextColor = (colorVal: string, saveSnap = true) => {
        if (colorInput && colorInput.value !== colorVal) colorInput.value = colorVal;
        const hex = this.extractHex(colorVal);
        if (colorPicker && hex.startsWith('#') && (hex.length === 7 || hex.length === 4)) {
          colorPicker.value = hex;
        }
        applyLiveStyle('textColor', 'color', colorVal);
        if (saveSnap) this.state.saveSnapshot();
      };

      colorPicker?.addEventListener('input', () => {
        setTextColor(colorPicker.value, false);
      });
      colorPicker?.addEventListener('change', () => {
        setTextColor(colorPicker.value, true);
      });

      colorInput?.addEventListener('input', () => {
        setTextColor(colorInput.value, false);
      });
      colorInput?.addEventListener('change', () => {
        setTextColor(colorInput.value, true);
      });

      this.element.querySelectorAll('.btn-text-color-dot').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const dotColor = (e.currentTarget as HTMLElement).dataset.color || '#ffffff';
          setTextColor(dotColor, true);
        });
      });

      // 8. Italic Style
      const italicEl = this.element.querySelector('#prop-font-italic') as HTMLInputElement;
      italicEl?.addEventListener('change', () => {
        const styleVal = italicEl.checked ? 'italic' : 'normal';
        applyLiveStyle('fontStyle', 'fontStyle', styleVal);
        this.state.saveSnapshot();
      });

      // 9. Uppercase
      const upperEl = this.element.querySelector('#prop-text-uppercase') as HTMLInputElement;
      upperEl?.addEventListener('change', () => {
        const transformVal = upperEl.checked ? 'uppercase' : 'none';
        applyLiveStyle('textTransform', 'textTransform', transformVal);
        this.state.saveSnapshot();
      });
    }

    // Image Block bindings
    if (blk.type === 'image') {
      bindVal('prop-object-fit', (v) => {
        blk.content.objectFit = v as any;
        const blockEl = document.querySelector(`[data-block-id="${blk.id}"]`);
        const imgEl = blockEl?.querySelector('.popup-img') as HTMLElement;
        if (imgEl) imgEl.style.objectFit = v;
        this.state.saveSnapshot();
      });
    }

    // Hero Video Block bindings
    if (blk.type === 'hero-video') {
      const modeSelect = this.element.querySelector('#prop-hero-video-mode') as HTMLSelectElement;
      const manifestRow = this.element.querySelector('#row-hero-manifest') as HTMLElement;
      const videoRow = this.element.querySelector('#row-hero-videourl') as HTMLElement;
      const manifestInput = this.element.querySelector('#prop-hero-manifest') as HTMLInputElement;
      const videoInput = this.element.querySelector('#prop-hero-videourl-input') as HTMLInputElement;

      modeSelect?.addEventListener('change', () => {
        if (modeSelect.value === 'manifest') {
          if (manifestRow) manifestRow.style.display = 'block';
          if (videoRow) videoRow.style.display = 'none';
          delete blk.content.videoUrl;
          if (!blk.content.manifestUrl) blk.content.manifestUrl = '/assets/frames/manifest.json';
        } else {
          if (manifestRow) manifestRow.style.display = 'none';
          if (videoRow) videoRow.style.display = 'block';
          if (!blk.content.videoUrl) blk.content.videoUrl = '';
        }
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:hero-video-updated', {
          blockId: blk.id,
          videoUrl: blk.content.videoUrl,
          manifestUrl: blk.content.manifestUrl
        });
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });

      manifestInput?.addEventListener('change', () => {
        blk.content.manifestUrl = manifestInput.value.trim();
        delete blk.content.videoUrl;
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:hero-video-updated', {
          blockId: blk.id,
          manifestUrl: blk.content.manifestUrl
        });
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });

      videoInput?.addEventListener('change', () => {
        blk.content.videoUrl = videoInput.value.trim();
        this.state.saveSnapshot();
        this.state.emitter.emit('builder:hero-video-updated', {
          blockId: blk.id,
          videoUrl: blk.content.videoUrl
        });
        this.state.emitter.emit('builder:page-updated', this.state.page);
      });

      this.element.querySelector('#btn-hero-pick-video')?.addEventListener('click', () => {
        this.mediaModal.open({
          onSelect: (asset) => {
            if (asset.name.endsWith('.json')) {
              blk.content.manifestUrl = asset.url;
              delete blk.content.videoUrl;
              if (manifestInput) manifestInput.value = asset.url;
              if (modeSelect) modeSelect.value = 'manifest';
              if (manifestRow) manifestRow.style.display = 'block';
              if (videoRow) videoRow.style.display = 'none';
            } else {
              blk.content.videoUrl = asset.url;
              if (videoInput) videoInput.value = asset.url;
              if (modeSelect) modeSelect.value = 'video';
              if (manifestRow) manifestRow.style.display = 'none';
              if (videoRow) videoRow.style.display = 'block';
            }
            this.state.saveSnapshot();
            this.state.emitter.emit('builder:hero-video-updated', {
              blockId: blk.id,
              videoUrl: blk.content.videoUrl,
              manifestUrl: blk.content.manifestUrl
            });
            this.state.emitter.emit('builder:page-updated', this.state.page);
          }
        });
      });
    }

    // Open media manager to set content URL
    this.element.querySelector('#btn-pick-media')?.addEventListener('click', () => {
      this.mediaModal.open({
        onSelect: (asset) => {
          if (blk.content.imageUrl !== undefined) blk.content.imageUrl = asset.url;
          if (blk.content.videoUrl !== undefined) blk.content.videoUrl = asset.url;
          if (blk.content.modelUrl !== undefined) blk.content.modelUrl = asset.url;
          if (blk.type === 'hero-video') {
            if (asset.name.endsWith('.json')) {
              blk.content.manifestUrl = asset.url;
              delete blk.content.videoUrl;
            } else {
              blk.content.videoUrl = asset.url;
            }
            this.state.emitter.emit('builder:hero-video-updated', {
              blockId: blk.id,
              videoUrl: blk.content.videoUrl,
              manifestUrl: blk.content.manifestUrl
            });
          }
          this.state.saveSnapshot();
          this.state.emitter.emit('builder:page-updated', this.state.page);
        }
      });
    });
  }

  private extractHex(colorStr?: string): string {
    if (!colorStr) return '#0a0d14';
    if (colorStr.startsWith('#') && (colorStr.length === 7 || colorStr.length === 4)) return colorStr;
    const hexMatch = colorStr.match(/#[0-9a-fA-F]{6}/);
    if (hexMatch) return hexMatch[0];
    return '#0a0d14';
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

    this.state.emitter.on('builder:section-bg-changed', (data: { sectionId: string; background: string }) => {
      if (this.state.activeSectionId === data.sectionId) {
        const quickText = this.element.querySelector('#sec-quick-bg-text') as HTMLInputElement;
        const quickPicker = this.element.querySelector('#sec-quick-rainbow') as HTMLInputElement;
        const secBgInput = this.element.querySelector('#sec-bg-input') as HTMLInputElement;
        const secRainbowPicker = this.element.querySelector('#sec-rainbow-picker') as HTMLInputElement;

        if (quickText) quickText.value = data.background;
        if (secBgInput) secBgInput.value = data.background;
        const hex = this.extractHex(data.background);
        if (quickPicker) quickPicker.value = hex;
        if (secRainbowPicker) secRainbowPicker.value = hex;
      }
    });
  }
}
