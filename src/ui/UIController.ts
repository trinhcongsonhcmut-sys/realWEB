import { PropertyMetadata, ViewMode, CameraState } from '../types';
import { EventEmitter } from '../core/EventEmitter';
import { RealEstateViewer } from '../core/RealEstateViewer';
import { HouseSelectorUI } from './HouseSelectorUI';
import { WaypointTunerUI } from './WaypointTunerUI';
import { DynamicCustomizerStore, CustomColorOption, CustomMaterialOption } from '../staging/DynamicCustomizerStore';
import { TextureLoaderService } from '../staging/TextureLoaderService';

export class UIController {
  private container: HTMLElement;
  private propertyData: PropertyMetadata;
  private emitter: EventEmitter;
  private viewer: RealEstateViewer;

  // Customizer Store & Selected Item
  private customizerStore: DynamicCustomizerStore = new DynamicCustomizerStore();
  private currentInspectedItem: { mesh?: any; itemKey: string; name: string; category?: string; description?: string } | null = null;
  private addColorModalEl!: HTMLElement;
  private addMaterialModalEl!: HTMLElement;
  private selectedMaterialFile: File | null = null;

  // Modular Sub-components (optional)
  public houseSelectorUI?: HouseSelectorUI;
  public waypointTunerUI?: WaypointTunerUI;

  // DOM Elements
  private overlayEl!: HTMLElement;
  private modalBackdrop!: HTMLElement;
  private scrollHintEl!: HTMLElement;
  private modeTabs: Map<ViewMode, HTMLElement> = new Map();
  private userStateEl!: HTMLElement;
  private propertyCardEl!: HTMLElement;
  private customizerPanelEl!: HTMLElement;
  private furniturePopupEl!: HTMLElement;
  private freeGlbHudEl!: HTMLElement;
  private walkBarEl!: HTMLElement;

  private currentUser: { name: string; email: string } | null = null;

  constructor(
    container: HTMLElement,
    propertyData: PropertyMetadata,
    emitter: EventEmitter,
    viewer: RealEstateViewer
  ) {
    this.container = container;
    this.propertyData = propertyData;
    this.emitter = emitter;
    this.viewer = viewer;

    this.renderUI();
    this.bindEvents();
  }

  private renderUI(): void {
    // 1. Root Overlay
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'ui-overlay';

    // 2. Header Bar
    const headerBar = document.createElement('header');
    headerBar.className = 'header-bar hud-interactive';
    headerBar.innerHTML = `
      <div class="brand-section" id="brand-container">
        <div class="brand-logo-badge glass-panel">
          <svg class="brand-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="brand-title">AURA 3D REAL ESTATE</span>
        </div>
        <div class="status-badge">
          <span class="status-dot"></span>
          <span>Đang mở bán</span>
        </div>
      </div>


      <div class="header-actions">
        <button id="btn-toggle-customizer" class="btn btn-secondary" title="Tùy biến nội thất">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
          <span>Tùy biến</span>
        </button>

        <button id="btn-inspect-furniture" class="btn btn-secondary" title="Khám phá nội thất phòng khách">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span>Nội thất phòng khách</span>
        </button>

        <button id="btn-quick-enter" class="btn btn-secondary" title="Tự do khám phá 3D và xoay 360 như file GLB">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span>Khám phá ngay</span>
        </button>

        <div id="user-auth-container">
          <button id="btn-open-login" class="btn btn-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            <span>Đăng nhập</span>
          </button>
        </div>
      </div>
    `;
    this.overlayEl.appendChild(headerBar);
    this.userStateEl = headerBar.querySelector('#user-auth-container') as HTMLElement;

    // 3. Property Information Card
    this.propertyCardEl = document.createElement('div');
    this.propertyCardEl.className = 'property-info-card glass-panel hud-interactive scrollable-ui';
    this.propertyCardEl.innerHTML = `
      <div class="prop-badge-row">
        <span class="prop-type">${this.propertyData.type}</span>
        <span style="font-size: 0.72rem; color: #34d399; font-weight: 600;">Sổ hồng riêng</span>
      </div>
      <div>
        <h2 class="prop-title">${this.propertyData.title}</h2>
        <p class="prop-address">${this.propertyData.address}</p>
      </div>

      <div class="prop-price-box">
        <span class="price-label">Giá niêm yết:</span>
        <span class="price-value">${this.propertyData.price.display}</span>
      </div>

      <div class="specs-grid">
        <div class="spec-item">
          <span class="spec-k">Diện tích đất</span>
          <span class="spec-v">${this.propertyData.specifications.landArea}</span>
        </div>
        <div class="spec-item">
          <span class="spec-k">Diện tích sàn</span>
          <span class="spec-v">${this.propertyData.specifications.usableArea}</span>
        </div>
        <div class="spec-item">
          <span class="spec-k">Kết cấu</span>
          <span class="spec-v">${this.propertyData.specifications.floors} Tầng • ${this.propertyData.specifications.bedrooms} PN</span>
        </div>
        <div class="spec-item">
          <span class="spec-k">Hướng nhà</span>
          <span class="spec-v">${this.propertyData.specifications.direction.split(' ')[0]}</span>
        </div>
      </div>

      <button id="btn-contact-advisor" class="btn btn-primary" style="width: 100%; margin-top: 4px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span>Liên hệ tư vấn viên</span>
      </button>
    `;
    this.propertyCardEl.style.display = 'none';
    // Do not append property card per user request
    // this.overlayEl.appendChild(this.propertyCardEl);

    // 4. Material Customizer Panel
    this.customizerPanelEl = document.createElement('div');
    this.customizerPanelEl.className = 'customizer-panel glass-panel hud-interactive scrollable-ui';
    this.customizerPanelEl.innerHTML = `
      <div class="customizer-header">
        <span class="customizer-title">Tùy biến vật liệu</span>
        <button id="btn-close-customizer" class="modal-close-btn" style="position: static; width: 26px; height: 26px;">
          ✕
        </button>
      </div>

      <div class="option-group">
        <span class="option-label">Màu sắc sofa nỉ</span>
        <div class="swatch-row" id="sofa-swatches">
          ${this.propertyData.customizableMaterials.sofaFabric.map((m, idx) => `
            <button class="swatch-btn ${idx === 0 ? 'active' : ''}" 
                    style="background-color: ${m.color};" 
                    data-type="sofa" 
                    data-color="${m.color}" 
                    data-roughness="${m.roughness}"
                    title="${m.name}"></button>
          `).join('')}
        </div>
      </div>

      <div class="option-group">
        <span class="option-label">Chất liệu sàn nhà</span>
        <div class="swatch-row" id="floor-swatches">
          ${this.propertyData.customizableMaterials.flooring.map((m, idx) => `
            <button class="swatch-btn ${idx === 0 ? 'active' : ''}" 
                    style="background-color: ${m.color};" 
                    data-type="floor" 
                    data-color="${m.color}" 
                    data-roughness="${m.roughness}"
                    title="${m.name}"></button>
          `).join('')}
        </div>
      </div>

      <div class="option-group">
        <span class="option-label">Sơn tường nội thất</span>
        <div class="swatch-row" id="wall-swatches">
          ${this.propertyData.customizableMaterials.wallColor.map((m, idx) => `
            <button class="swatch-btn ${idx === 0 ? 'active' : ''}" 
                    style="background-color: ${m.color};" 
                    data-type="wall" 
                    data-color="${m.color}" 
                    title="${m.name}"></button>
          `).join('')}
        </div>
      </div>
    `;
    this.overlayEl.appendChild(this.customizerPanelEl);

    // 4b. Furniture & Decor Picker Popup
    // 4b. Living Room Furniture Customizer & Inspector Popup
    this.furniturePopupEl = document.createElement('div');
    this.furniturePopupEl.id = 'furniture-popup';
    this.furniturePopupEl.className = 'furniture-popup glass-panel hud-interactive scrollable-ui';
    this.furniturePopupEl.style.display = 'none';
    this.furniturePopupEl.innerHTML = `
      <div class="furniture-popup-header">
        <div class="furniture-popup-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span id="furn-popup-header-title">Tùy Biến Đồ Nội Thất</span>
        </div>
        <button id="btn-close-furniture-popup" class="modal-close-btn" title="Đóng">✕</button>
      </div>

      <div class="furniture-item-card">
        <div class="furniture-badge-row">
          <span class="furniture-badge" id="furn-item-category">Hệ thống chiếu sáng</span>
          <span class="furniture-status">✨ Đang chọn</span>
        </div>
        <h4 class="furniture-card-title" id="furn-item-name">Đèn Cây Đứng Wabi-Sabi Độc Bản</h4>
        <p class="furniture-card-desc" id="furn-item-desc">
          Đèn cây đứng cao 1.6m chao giấy thủ công, điểm nhấn ánh sáng nghệ thuật cho góc thư giãn đọc sách.
        </p>
      </div>

      <!-- SECTION 1: MÀU SẮC ĐỒ VẬT -->
      <div class="furn-custom-section">
        <div class="furn-section-header">
          <div class="furn-section-title">
            <span>🎨</span>
            <span>Màu Sắc Đồ Vật</span>
          </div>
          <button id="btn-open-add-color" class="btn btn-xs" title="Thêm màu mới vào danh sách đồ vật này">
            <span>+ Thêm màu sắc</span>
          </button>
        </div>
        <div class="furn-swatch-list" id="furn-colors-list">
          <!-- Rendered dynamically -->
        </div>
      </div>

      <!-- SECTION 2: CHẤT LIỆU & VÂN PBR -->
      <div class="furn-custom-section">
        <div class="furn-section-header">
          <div class="furn-section-title">
            <span>✨</span>
            <span>Chất Liệu & Vân PBR</span>
          </div>
          <button id="btn-open-add-material" class="btn btn-xs" title="Tải ảnh vân vật liệu mới từ máy tính">
            <span>+ Thêm vật liệu</span>
          </button>
        </div>
        <div class="furn-material-grid" id="furn-materials-list">
          <!-- Rendered dynamically -->
        </div>
      </div>

      <div class="furniture-actions-row" style="margin-top: 10px;">
        <button id="btn-focus-livingroom" class="btn btn-gold btn-sm" title="Chiếu camera vào tâm phòng khách xoay 360 độ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"></path>
          </svg>
          <span>Xoay 360° Phòng Khách</span>
        </button>
      </div>
    `;
    this.overlayEl.appendChild(this.furniturePopupEl);

    // 4c. Modal: Thêm Màu Sắc Mới
    this.addColorModalEl = document.createElement('div');
    this.addColorModalEl.id = 'modal-add-color';
    this.addColorModalEl.className = 'auth-modal-backdrop';
    this.addColorModalEl.style.display = 'none';
    this.addColorModalEl.style.zIndex = '10001';
    this.addColorModalEl.innerHTML = `
      <div class="custom-modal-card glass-panel hud-interactive">
        <div class="custom-modal-header">
          <div class="custom-modal-title">
            <span>🎨</span>
            <span>Thêm Màu Sắc Mới Cho Đồ Vật</span>
          </div>
          <button id="btn-close-add-color-modal" class="modal-close-btn">✕</button>
        </div>
        <div class="custom-modal-body">
          <div class="form-group">
            <label class="form-label">Tên màu sắc</label>
            <input type="text" id="inp-new-color-name" class="form-input" placeholder="Ví dụ: Vàng Ánh Kim, Đỏ Burgundy, Nâu Trầm...">
          </div>
          <div class="form-group">
            <label class="form-label">Chọn mã màu</label>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="color" id="inp-new-color-picker" value="#d4af37" style="width: 48px; height: 40px; border-radius: 8px; border: none; cursor: pointer; background: transparent;">
              <input type="text" id="inp-new-color-hex" class="form-input" value="#d4af37" style="flex: 1; font-family: monospace; font-weight: 600;">
            </div>
          </div>
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <label class="form-label">Độ bóng / Nhám mờ</label>
              <span id="lbl-new-color-roughness" style="font-size: 0.75rem; color: #38bdf8;">50%</span>
            </div>
            <input type="range" id="inp-new-color-roughness" min="0" max="100" value="50" style="width: 100%;">
            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #94a3b8; margin-top: 2px;">
              <span>Bóng gương (0%)</span>
              <span>Nhám mờ (100%)</span>
            </div>
          </div>
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <label class="form-label">Ánh kim loại (Metalness)</label>
              <span id="lbl-new-color-metalness" style="font-size: 0.75rem; color: #38bdf8;">0%</span>
            </div>
            <input type="range" id="inp-new-color-metalness" min="0" max="100" value="0" style="width: 100%;">
          </div>
        </div>
        <div class="custom-modal-footer">
          <button id="btn-cancel-add-color" class="btn btn-secondary btn-sm">Hủy</button>
          <button id="btn-save-new-color" class="btn btn-gold btn-sm">💾 Lưu & Áp Dụng Ngay</button>
        </div>
      </div>
    `;
    this.overlayEl.appendChild(this.addColorModalEl);

    // 4d. Modal: Tải Lên Vật Liệu / Vân Mới
    this.addMaterialModalEl = document.createElement('div');
    this.addMaterialModalEl.id = 'modal-add-material';
    this.addMaterialModalEl.className = 'auth-modal-backdrop';
    this.addMaterialModalEl.style.display = 'none';
    this.addMaterialModalEl.style.zIndex = '10001';
    this.addMaterialModalEl.innerHTML = `
      <div class="custom-modal-card glass-panel hud-interactive">
        <div class="custom-modal-header">
          <div class="custom-modal-title">
            <span>✨</span>
            <span>Tải Lên Vật Liệu / Vân Mới</span>
          </div>
          <button id="btn-close-add-material-modal" class="modal-close-btn">✕</button>
        </div>
        <div class="custom-modal-body">
          <div class="form-group">
            <label class="form-label">Tên vật liệu</label>
            <input type="text" id="inp-new-material-name" class="form-input" placeholder="Ví dụ: Gạch Men Ý 80x80, Gỗ Walnut Bắc Mỹ...">
          </div>
          <div class="form-group">
            <label class="form-label">Loại bề mặt</label>
            <select id="sel-new-material-type" class="form-input" style="cursor: pointer;">
              <option value="wood">Vân Gỗ Tự Nhiên (Wood)</option>
              <option value="ceramic" selected>Gạch Men / Gốm Sứ (Ceramic Tiles)</option>
              <option value="marble">Đá Cẩm Thạch (Marble Stone)</option>
              <option value="fabric">Vải Nỉ / Da Bò (Fabric & Leather)</option>
              <option value="metal">Kim Loại / Đồng / Thép (Metal)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tải ảnh vân bề mặt từ máy tính (.jpg, .png, .webp)</label>
            <div id="dropzone-material-file" class="file-dropzone">
              <input type="file" id="inp-new-material-file" accept="image/png, image/jpeg, image/webp" style="display: none;">
              <div id="dropzone-empty-view">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p style="margin: 8px 0 2px 0; font-size: 0.85rem; font-weight: 600;">Nhấp để chọn file ảnh texture từ máy tính</p>
                <p style="margin: 0; font-size: 0.72rem; color: #94a3b8;">Khuyến nghị ảnh vuông 1024x1024 hoặc 2048x2048</p>
              </div>
              <div id="dropzone-preview-view" style="display: none; align-items: center; gap: 12px;">
                <img id="img-material-preview" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
                <div style="flex: 1; text-align: left;">
                  <p id="lbl-material-filename" style="margin: 0; font-size: 0.82rem; font-weight: 600; color: #34d399;"></p>
                  <span style="font-size: 0.72rem; color: #94a3b8;">Nhấp để đổi ảnh khác</span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <label class="form-label">Tỷ lệ lặp vân (Texture Tiling)</label>
              <span style="font-size: 0.75rem; color: #38bdf8;">Đẹp nhất cho sàn nhà</span>
            </div>
            <select id="sel-new-material-repeat" class="form-input" style="cursor: pointer;">
              <option value="1">1x (Đồ vật nhỏ: đèn, bình gốm)</option>
              <option value="2">2x (Bàn trà, kệ tủ)</option>
              <option value="4" selected>4x (Chuẩn cho Sàn nhà, Bộ Sofa)</option>
              <option value="8">8x (Sàn rộng / Gạch men khổ nhỏ)</option>
            </select>
          </div>
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <label class="form-label">Độ bóng / Nhám</label>
              <span id="lbl-new-material-roughness" style="font-size: 0.75rem; color: #38bdf8;">35%</span>
            </div>
            <input type="range" id="inp-new-material-roughness" min="0" max="100" value="35" style="width: 100%;">
          </div>
        </div>
        <div class="custom-modal-footer">
          <button id="btn-cancel-add-material" class="btn btn-secondary btn-sm">Hủy</button>
          <button id="btn-save-new-material" class="btn btn-gold btn-sm">🚀 Tải Lên & Áp Dụng</button>
        </div>
      </div>
    `;
    this.overlayEl.appendChild(this.addMaterialModalEl);

    // 5. Bottom Navigation HUD
    const bottomHud = document.createElement('div');
    bottomHud.className = 'bottom-hud';

    // Scroll Hint (hidden completely as requested)
    this.scrollHintEl = document.createElement('div');
    this.scrollHintEl.className = 'scroll-hint-pill glass-panel';
    this.scrollHintEl.style.display = 'none';

    // Quick Room Jump Chips (Visible when in interior mode)
    const roomChipsBar = document.createElement('div');
    roomChipsBar.className = 'room-chips-bar glass-panel';
    roomChipsBar.id = 'room-chips';
    roomChipsBar.innerHTML = this.propertyData.hotspots.map((hs) => `
      <button class="room-chip" data-hs-id="${hs.id}">
        ${hs.name}
      </button>
    `).join('');
    bottomHud.appendChild(roomChipsBar);

    // Interactive Walkthrough Controller Bar
    // Interactive Walkthrough Controller Bar with 5 Defined Stages:
    // 2 cấp ngoài nhà: Cấp 1 (Ngoại thất), Cấp 2 (Qua cửa chính vào sảnh)
    // 3 cấp trong phòng: Cấp 3 (Vào phòng ngủ), Cấp 4 (Giường Master), Cấp 5 (Xoay 360°)
    const walkBar = document.createElement('div');
    walkBar.className = 'walkthrough-bar glass-panel';
    walkBar.id = 'walkthrough-bar';
    this.walkBarEl = walkBar;
    walkBar.innerHTML = `
      <div class="walk-stages-row">
        <!-- Video 1: 3 Cấp lăn chuột nhanh bao quát ngoại thất -->
        <button class="stage-chip active" data-progress="0.0" title="Cấp 1: Toàn cảnh flycam trên cao góc xa">
          <span class="stage-badge">1</span>
          <span class="stage-label">Toàn cảnh</span>
        </button>
        <button class="stage-chip" data-progress="0.10" title="Cấp 2: Flycam lướt xoay góc phố tiếp cận">
          <span class="stage-badge">2</span>
          <span class="stage-label">Góc phố</span>
        </button>
        <button class="stage-chip" data-progress="0.21" title="Cấp 3: Chính diện mặt tiền trên cao (Tiếp nối video 2)">
          <span class="stage-badge">3</span>
          <span class="stage-label">Mặt tiền</span>
        </button>
        <div class="stage-divider"></div>
        <!-- Video 2 & Nội thất 3D: Đồng bộ tốc độ chuyển động chuẩn -->
        <button class="stage-chip" data-progress="0.45" title="Cấp 4: Bay qua cổng sắt vào sân trước & vườn zen">
          <span class="stage-badge">4</span>
          <span class="stage-label">Qua cổng</span>
        </button>
        <button class="stage-chip" data-progress="0.60" title="Cấp 5: Dừng trước bậc tam cấp nhìn qua kính">
          <span class="stage-badge">5</span>
          <span class="stage-label">Trước cửa</span>
        </button>
        <button class="stage-chip" data-progress="0.75" title="Cấp 6: Cửa mở & Chuyển giao vào phòng khách 3D">
          <span class="stage-badge">6</span>
          <span class="stage-label">Vào phòng <span class="badge-360">360°</span></span>
        </button>
        <button class="stage-chip" data-progress="1.0" title="Cấp 7: Tâm phòng khách 3D - Khám phá & chọn nội thất">
          <span class="stage-badge">7</span>
          <span class="stage-label">Nội thất <span class="badge-360">360°</span></span>
        </button>
      </div>

      <div class="walk-controls-row">
        <button id="btn-walk-backward" class="walk-nav-btn" title="Lùi lại cấp trước">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span>Lùi</span>
        </button>

        <div class="walk-slider-wrap">
          <input type="range" id="walk-range" min="0" max="100" value="0" class="walk-range-input" title="Lăn chuột hoặc kéo thanh trượt để di chuyển">
        </div>

        <button id="btn-walk-forward" class="walk-nav-btn walk-nav-primary" title="Tiến lên cấp tiếp theo">
          <span>Tiến</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    `;
    bottomHud.appendChild(walkBar);

    // Mode Selector Bar
    const modeBar = document.createElement('div');
    modeBar.className = 'view-mode-bar glass-panel';
    modeBar.innerHTML = `
      <button class="mode-tab active" data-mode="exterior">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M2 12h20"></path>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <span>Toàn cảnh</span>
      </button>

      <button class="mode-tab" data-mode="interior">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Nội thất 360°</span>
      </button>

      <button class="mode-tab" data-mode="dollhouse">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <span>Cắt lớp Dollhouse</span>
      </button>

      <button class="mode-tab" data-mode="floorplan">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        <span>Mặt bằng Floor Plan</span>
      </button>
    `;
    bottomHud.appendChild(modeBar);

    modeBar.querySelectorAll<HTMLElement>('.mode-tab').forEach((tab) => {
      const mode = tab.getAttribute('data-mode') as ViewMode;
      this.modeTabs.set(mode, tab);
    });

    this.overlayEl.appendChild(bottomHud);

    // Toast hint container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-hint-container';
    toastContainer.className = 'toast-hint-container';
    this.overlayEl.appendChild(toastContainer);

    this.container.appendChild(this.overlayEl);

    // 6. Integrated Glass Login / Register Modal
    this.modalBackdrop = document.createElement('div');
    this.modalBackdrop.className = 'modal-backdrop';
    this.modalBackdrop.innerHTML = `
      <div class="auth-modal glass-panel hud-interactive">
        <button id="btn-close-modal" class="modal-close-btn" title="Đóng">✕</button>

        <div class="auth-header">
          <h3 class="auth-title">Đăng Nhập Khách Hàng</h3>
          <p class="auth-subtitle">Trải nghiệm lưu cấu hình nhà mẫu và nhận báo giá ưu đãi</p>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab-btn active" data-tab="login">Đăng nhập</button>
          <button class="auth-tab-btn" data-tab="register">Đăng ký tài khoản</button>
        </div>

        <form class="auth-form" id="form-auth">
          <div class="input-group">
            <label for="inp-email">Địa chỉ Email hoặc Số điện thoại</label>
            <input type="text" id="inp-email" class="input-field" placeholder="khachhang@aura.vn" value="vip.buyer@gmail.com" required>
          </div>

          <div class="input-group">
            <label for="inp-pass">Mật khẩu</label>
            <input type="password" id="inp-pass" class="input-field" placeholder="••••••••" value="Secret123!" required>
          </div>

          <div class="auth-remember-row">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="checkbox" checked style="accent-color: var(--primary);">
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" id="link-forgot">Quên mật khẩu?</a>
          </div>

          <button type="submit" class="btn btn-gold" style="width: 100%; margin-top: 6px;">
            Đăng nhập ngay
          </button>
        </form>

        <div class="auth-divider">
          <span>Hoặc tiếp tục với</span>
        </div>

        <button id="btn-guest-login" class="btn btn-secondary" style="width: 100%;">
          <span>Trải nghiệm nhanh (Khách vãng lai)</span>
        </button>
      </div>
    `;
    this.container.appendChild(this.modalBackdrop);

    // Free GLB 360 Exploration Floating HUD Pill
    this.freeGlbHudEl = document.createElement('div');
    this.freeGlbHudEl.className = 'free-glb-hud glass-panel hud-interactive';
    this.freeGlbHudEl.style.display = 'none';
    this.freeGlbHudEl.innerHTML = `
      <div class="free-glb-badge">
        <span class="live-dot"></span>
        <span>TỰ DO THAO TÁC 3D GLB</span>
      </div>
      <div class="free-glb-controls-hint">
        <span class="hint-item">🖱️ <b>Chuột trái:</b> Xoay 360° tại chỗ</span>
        <span class="hint-sep">•</span>
        <span class="hint-item">🖱️ <b>Chuột phải:</b> Trượt ngang (Pan)</span>
        <span class="hint-sep">•</span>
        <span class="hint-item">⚙️ <b>Cuộn chuột:</b> Tiến / Lùi</span>
        <span class="hint-sep">•</span>
        <span class="hint-item">⌨️ <b>W A S D:</b> Đi lại trong phòng</span>
      </div>
      <button id="btn-recenter-free-glb" class="btn btn-secondary btn-sm" title="Định tâm góc nhìn về giữa phòng khách">
        <span>🎯 Căn giữa</span>
      </button>
      <button id="btn-exit-free-glb" class="btn btn-secondary btn-sm" title="Quay lại tham quan toàn cảnh">
        <span>✕ Thoát tự do</span>
      </button>
    `;
    this.overlayEl.appendChild(this.freeGlbHudEl);
  }

  private bindEvents(): void {
    // Header actions
    const btnLogin = this.overlayEl.querySelector('#btn-open-login');
    if (btnLogin) btnLogin.addEventListener('click', () => this.openLoginModal());

    const btnCloseModal = this.modalBackdrop.querySelector('#btn-close-modal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeLoginModal());

    const btnQuickEnter = this.overlayEl.querySelector('#btn-quick-enter');
    if (btnQuickEnter) {
      btnQuickEnter.addEventListener('click', () => {
        if (this.viewer.glbFreeController && this.viewer.glbFreeController.isActive) {
          // If already in free mode, smoothly refocus to center of living room
          this.viewer.enterFreeGlbMode();
          this.showToast('🎯 Đã căn giữa góc nhìn tự do 360° phòng khách');
        } else {
          this.viewer.enterFreeGlbMode();
          this.showToast('🎮 Đã bật chế độ tự do di chuyển & xoay 360° (như file GLB)!');
        }
      });
    }

    const btnRecenter = this.freeGlbHudEl.querySelector('#btn-recenter-free-glb');
    if (btnRecenter) {
      btnRecenter.addEventListener('click', () => {
        this.viewer.enterFreeGlbMode();
        this.showToast('🎯 Đã căn giữa góc nhìn phòng khách');
      });
    }

    const btnExitFreeGlb = this.freeGlbHudEl.querySelector('#btn-exit-free-glb');
    if (btnExitFreeGlb) {
      btnExitFreeGlb.addEventListener('click', () => {
        this.viewer.exitFreeGlbMode();
        this.showToast('Đã quay lại lộ trình toàn cảnh.');
      });
    }

    const btnToggleInfo = this.overlayEl.querySelector('#btn-toggle-info');
    if (btnToggleInfo) {
      btnToggleInfo.addEventListener('click', () => {
        const isHidden = this.propertyCardEl.style.display === 'none';
        this.propertyCardEl.style.display = isHidden ? 'flex' : 'none';
      });
    }

    const btnToggleCustomizer = this.overlayEl.querySelector('#btn-toggle-customizer');
    if (btnToggleCustomizer) {
      btnToggleCustomizer.addEventListener('click', () => {
        const isHidden = this.customizerPanelEl.style.display === 'none';
        this.customizerPanelEl.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) {
          this.furniturePopupEl.style.display = 'none';
        }
      });
    }

    const btnCloseCustomizer = this.customizerPanelEl.querySelector('#btn-close-customizer');
    if (btnCloseCustomizer) {
      btnCloseCustomizer.addEventListener('click', () => {
        this.customizerPanelEl.style.display = 'none';
      });
    }

    // Toggle Furniture & Decor Popup
    // Living Room Furniture Inspector Button
    const btnInspectFurniture = this.overlayEl.querySelector('#btn-inspect-furniture');
    if (btnInspectFurniture) {
      btnInspectFurniture.addEventListener('click', () => {
        const isHidden = this.furniturePopupEl.style.display === 'none';
        this.furniturePopupEl.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) {
          this.customizerPanelEl.style.display = 'none';
          this.viewer.furniture.focusOnLivingRoom();
          this.showToast('✨ Khám phá phòng khách 3D! Nhấp vào các đồ nội thất để xem thông số.');
        }
      });
    }

    const btnCloseFurniture = this.furniturePopupEl.querySelector('#btn-close-furniture-popup');
    if (btnCloseFurniture) {
      btnCloseFurniture.addEventListener('click', () => {
        this.furniturePopupEl.style.display = 'none';
      });
    }

    // Focus Living Room Button inside popup
    const btnFocusLivingRoom = this.furniturePopupEl.querySelector('#btn-focus-livingroom');
    if (btnFocusLivingRoom) {
      btnFocusLivingRoom.addEventListener('click', () => {
        this.viewer.enterFreeGlbMode();
        this.showToast('✨ Camera đã căn giữa phòng khách, xoay 360° & đi lại tự do!');
      });
    }

    // Modal: Thêm Màu Sắc Mới
    const btnOpenAddColor = this.furniturePopupEl.querySelector('#btn-open-add-color');
    if (btnOpenAddColor) {
      btnOpenAddColor.addEventListener('click', () => {
        this.addColorModalEl.style.display = 'flex';
      });
    }

    const btnCloseAddColor = this.addColorModalEl.querySelector('#btn-close-add-color-modal');
    const btnCancelAddColor = this.addColorModalEl.querySelector('#btn-cancel-add-color');
    const closeAddColorModal = () => {
      this.addColorModalEl.style.display = 'none';
    };
    if (btnCloseAddColor) btnCloseAddColor.addEventListener('click', closeAddColorModal);
    if (btnCancelAddColor) btnCancelAddColor.addEventListener('click', closeAddColorModal);

    const inpColorPicker = this.addColorModalEl.querySelector('#inp-new-color-picker') as HTMLInputElement;
    const inpColorHex = this.addColorModalEl.querySelector('#inp-new-color-hex') as HTMLInputElement;
    const inpColorRoughness = this.addColorModalEl.querySelector('#inp-new-color-roughness') as HTMLInputElement;
    const lblColorRoughness = this.addColorModalEl.querySelector('#lbl-new-color-roughness');
    const inpColorMetalness = this.addColorModalEl.querySelector('#inp-new-color-metalness') as HTMLInputElement;
    const lblColorMetalness = this.addColorModalEl.querySelector('#lbl-new-color-metalness');

    if (inpColorPicker && inpColorHex) {
      inpColorPicker.addEventListener('input', () => {
        inpColorHex.value = inpColorPicker.value;
      });
      inpColorHex.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(inpColorHex.value)) {
          inpColorPicker.value = inpColorHex.value;
        }
      });
    }

    if (inpColorRoughness && lblColorRoughness) {
      inpColorRoughness.addEventListener('input', () => {
        lblColorRoughness.textContent = `${inpColorRoughness.value}%`;
      });
    }
    if (inpColorMetalness && lblColorMetalness) {
      inpColorMetalness.addEventListener('input', () => {
        lblColorMetalness.textContent = `${inpColorMetalness.value}%`;
      });
    }

    const btnSaveColor = this.addColorModalEl.querySelector('#btn-save-new-color');
    if (btnSaveColor) {
      btnSaveColor.addEventListener('click', () => {
        if (!this.currentInspectedItem) {
          this.showToast('⚠️ Vui lòng chọn một đồ vật trong phòng trước.');
          return;
        }
        const nameInput = this.addColorModalEl.querySelector('#inp-new-color-name') as HTMLInputElement;
        const hex = inpColorHex.value || '#d4af37';
        const roughness = parseFloat(inpColorRoughness.value) / 100;
        const metalness = parseFloat(inpColorMetalness.value) / 100;
        const colorName = nameInput.value.trim() || `Màu tùy chỉnh ${hex}`;

        const newColor: CustomColorOption = {
          id: `custom-color-${Date.now()}`,
          name: colorName,
          color: hex,
          roughness,
          metalness,
          isCustom: true,
        };

        this.customizerStore.addColor(this.currentInspectedItem.itemKey, newColor);
        this.viewer.furniture.changeInspectedColor(hex, roughness, metalness);
        this.renderItemColors(this.currentInspectedItem.itemKey);
        closeAddColorModal();
        nameInput.value = '';
        this.showToast(`✨ Đã thêm màu '${colorName}' và áp dụng thành công!`);
      });
    }

    // Modal: Tải Lên Vật Liệu / Vân Mới
    const btnOpenAddMaterial = this.furniturePopupEl.querySelector('#btn-open-add-material');
    if (btnOpenAddMaterial) {
      btnOpenAddMaterial.addEventListener('click', () => {
        this.addMaterialModalEl.style.display = 'flex';
      });
    }

    const btnCloseAddMaterial = this.addMaterialModalEl.querySelector('#btn-close-add-material-modal');
    const btnCancelAddMaterial = this.addMaterialModalEl.querySelector('#btn-cancel-add-material');
    const dropzone = this.addMaterialModalEl.querySelector('#dropzone-material-file');
    const inpMaterialFile = this.addMaterialModalEl.querySelector('#inp-new-material-file') as HTMLInputElement;
    const previewView = this.addMaterialModalEl.querySelector('#dropzone-preview-view') as HTMLElement;
    const emptyView = this.addMaterialModalEl.querySelector('#dropzone-empty-view') as HTMLElement;
    const imgPreview = this.addMaterialModalEl.querySelector('#img-material-preview') as HTMLImageElement;
    const lblFilename = this.addMaterialModalEl.querySelector('#lbl-material-filename') as HTMLElement;

    const closeAddMaterialModal = () => {
      this.addMaterialModalEl.style.display = 'none';
      this.selectedMaterialFile = null;
      if (previewView) previewView.style.display = 'none';
      if (emptyView) emptyView.style.display = 'flex';
      if (inpMaterialFile) inpMaterialFile.value = '';
    };
    if (btnCloseAddMaterial) btnCloseAddMaterial.addEventListener('click', closeAddMaterialModal);
    if (btnCancelAddMaterial) btnCancelAddMaterial.addEventListener('click', closeAddMaterialModal);

    if (dropzone && inpMaterialFile) {
      dropzone.addEventListener('click', () => {
        inpMaterialFile.click();
      });

      inpMaterialFile.addEventListener('change', () => {
        if (inpMaterialFile.files && inpMaterialFile.files.length > 0) {
          const file = inpMaterialFile.files[0];
          this.selectedMaterialFile = file;
          if (lblFilename) lblFilename.textContent = file.name;

          const reader = new FileReader();
          reader.onload = (e) => {
            if (imgPreview && e.target) {
              imgPreview.src = e.target.result as string;
            }
            if (emptyView) emptyView.style.display = 'none';
            if (previewView) previewView.style.display = 'flex';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const inpMatRoughness = this.addMaterialModalEl.querySelector('#inp-new-material-roughness') as HTMLInputElement;
    const lblMatRoughness = this.addMaterialModalEl.querySelector('#lbl-new-material-roughness');
    if (inpMatRoughness && lblMatRoughness) {
      inpMatRoughness.addEventListener('input', () => {
        lblMatRoughness.textContent = `${inpMatRoughness.value}%`;
      });
    }

    const btnSaveMaterial = this.addMaterialModalEl.querySelector('#btn-save-new-material');
    if (btnSaveMaterial) {
      btnSaveMaterial.addEventListener('click', async () => {
        if (!this.currentInspectedItem) {
          this.showToast('⚠️ Vui lòng chọn một đồ vật trong phòng trước.');
          return;
        }
        const nameInput = this.addMaterialModalEl.querySelector('#inp-new-material-name') as HTMLInputElement;
        const selType = this.addMaterialModalEl.querySelector('#sel-new-material-type') as HTMLSelectElement;
        const selRepeat = this.addMaterialModalEl.querySelector('#sel-new-material-repeat') as HTMLSelectElement;

        const matType = (selType?.value || 'ceramic') as 'wood' | 'ceramic' | 'marble' | 'fabric' | 'metal';
        const repeat = parseInt(selRepeat?.value || '4', 10);
        const roughness = inpMatRoughness ? parseFloat(inpMatRoughness.value) / 100 : 0.35;
        const matName = nameInput?.value.trim() || (this.selectedMaterialFile ? this.selectedMaterialFile.name.replace(/\.[^/.]+$/, '') : 'Vật liệu mới');

        let thumbUrl = '';
        let textureDataUrl = '';
        if (this.selectedMaterialFile) {
          textureDataUrl = await TextureLoaderService.getInstance().readImageFile(this.selectedMaterialFile);
          thumbUrl = textureDataUrl;
        } else {
          // Procedural fallback if user doesn't pick file
          const procType = (['wood', 'ceramic', 'marble', 'fabric'].includes(matType) ? matType : 'ceramic') as 'wood' | 'ceramic' | 'marble' | 'fabric';
          const proc = TextureLoaderService.getInstance().createProceduralTexture(procType, '#b8a383', repeat, repeat);
          thumbUrl = proc.thumbUrl;
        }

        const newMat: CustomMaterialOption = {
          id: `custom-mat-${Date.now()}`,
          name: matName,
          type: matType,
          thumbUrl: thumbUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%2394a3b8"/></svg>',
          textureDataUrl: textureDataUrl || undefined,
          textureUrl: textureDataUrl || undefined,
          repeatX: repeat,
          repeatY: repeat,
          roughness,
          metalness: matType === 'metal' ? 0.8 : 0.05,
          isCustom: true,
        };

        this.customizerStore.addMaterial(this.currentInspectedItem.itemKey, newMat);
        await this.viewer.furniture.changeInspectedMaterial(newMat);
        this.renderItemMaterials(this.currentInspectedItem.itemKey);
        closeAddMaterialModal();
        if (nameInput) nameInput.value = '';
        this.showToast(`✨ Đã tải lên và áp dụng vật liệu '${matName}'!`);
      });
    }

    // Auth form submit
    const authForm = this.modalBackdrop.querySelector('#form-auth');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = (this.modalBackdrop.querySelector('#inp-email') as HTMLInputElement).value;
        this.handleLoginSuccess(email.split('@')[0] || 'Quý Khách', email);
      });
    }

    const btnGuest = this.modalBackdrop.querySelector('#btn-guest-login');
    if (btnGuest) {
      btnGuest.addEventListener('click', () => {
        this.handleLoginSuccess('Khách Tham Quan', 'guest@aura.vn');
      });
    }

    // View Mode Tabs
    this.modeTabs.forEach((tab, mode) => {
      tab.addEventListener('click', () => {
        if (mode === 'interior') {
          this.viewer.enterFreeGlbMode();
        } else {
          this.viewer.setViewMode(mode);
        }
      });
    });

    // Listen for Free GLB mode state changes
    this.emitter.on('camera:free-glb-mode-changed', (active: boolean) => {
      const btn = this.overlayEl.querySelector('#btn-quick-enter') as HTMLElement;
      if (active) {
        if (btn) {
          btn.classList.add('btn-gold');
          btn.classList.remove('btn-secondary');
          btn.innerHTML = `
            <span class="live-dot" style="margin-right: 6px;"></span>
            <span>Tự do 360° (Đang bật)</span>
          `;
        }
        this.freeGlbHudEl.style.display = 'flex';
        if (this.walkBarEl) this.walkBarEl.style.display = 'none';
      } else {
        if (btn) {
          btn.classList.remove('btn-gold');
          btn.classList.add('btn-secondary');
          btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Khám phá ngay</span>
          `;
        }
        this.freeGlbHudEl.style.display = 'none';
        if (this.walkBarEl) this.walkBarEl.style.display = 'flex';
      }
    });

    // Room jump chips
    const roomChips = this.overlayEl.querySelectorAll<HTMLElement>('.room-chip');
    roomChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const hsId = chip.getAttribute('data-hs-id');
        const hs = this.propertyData.hotspots.find((h) => h.id === hsId);
        if (hs) {
          this.emitter.emit('hotspot:selected', hs);
        }
      });
    });

    // Material Swatches
    const swatches = this.customizerPanelEl.querySelectorAll<HTMLElement>('.swatch-btn');
    swatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        const type = swatch.getAttribute('data-type');
        const color = swatch.getAttribute('data-color')!;
        const roughness = parseFloat(swatch.getAttribute('data-roughness') || '0.5');

        // Toggle active style in parent row
        swatch.parentElement?.querySelectorAll('.swatch-btn').forEach((b) => b.classList.remove('active'));
        swatch.classList.add('active');

        if (type === 'sofa') {
          this.viewer.updateSofaColor(color, roughness);
        } else if (type === 'floor') {
          this.viewer.updateFloorMaterial(color, roughness);
        } else if (type === 'wall') {
          this.viewer.updateWallColor(color);
        }
      });
    });

    // Contact advisor button
    const btnContact = this.propertyCardEl.querySelector('#btn-contact-advisor');
    if (btnContact) {
      btnContact.addEventListener('click', () => {
        alert('Cảm ơn Quý khách! Chuyên viên tư vấn dự án The Green Horizon sẽ liên hệ trong ít phút qua số điện thoại đã lưu.');
      });
    }

    // Walkthrough Bar Controls
    const btnWalkForward = this.overlayEl.querySelector('#btn-walk-forward');
    if (btnWalkForward) {
      btnWalkForward.addEventListener('click', () => {
        this.viewer.cameraController.stepForward();
      });
    }

    const btnWalkBackward = this.overlayEl.querySelector('#btn-walk-backward');
    if (btnWalkBackward) {
      btnWalkBackward.addEventListener('click', () => {
        this.viewer.cameraController.stepBackward();
      });
    }

    const walkRange = this.overlayEl.querySelector('#walk-range') as HTMLInputElement;
    if (walkRange) {
      walkRange.addEventListener('input', () => {
        const val = parseFloat(walkRange.value) / 100;
        this.viewer.cameraController.setWalkProgress(val);
      });
    }

    // Stage chips (5 Cấp độ: 2 ngoài nhà, 3 trong phòng)
    const stageChips = this.overlayEl.querySelectorAll<HTMLElement>('.stage-chip');
    stageChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const targetP = parseFloat(chip.getAttribute('data-progress') || '0.0');
        this.viewer.cameraController.setWalkProgress(targetP);
      });
    });

    // Sync slider and active stage chips with real-time camera scroll progress
    this.emitter.on('camera:scroll-progress', (progress: number) => {
      if (walkRange) {
        walkRange.value = Math.round(progress * 100).toString();
      }

      let activeIndex = 0;
      if (progress < 0.05) activeIndex = 0;
      else if (progress < 0.15) activeIndex = 1;
      else if (progress < 0.33) activeIndex = 2;
      else if (progress < 0.52) activeIndex = 3;
      else if (progress < 0.67) activeIndex = 4;
      else if (progress < 0.87) activeIndex = 5;
      else activeIndex = 6;

      stageChips.forEach((chip, idx) => {
        if (idx === activeIndex) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    });

    // Sync State with Emitter
    this.emitter.on<ViewMode>('view:mode-changed', (mode) => {
      this.modeTabs.forEach((tab, m) => {
        if (m === mode) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      if (mode === 'interior') {
        this.scrollHintEl.innerHTML = `
          <svg class="scroll-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Đã vào trong nhà: Kéo chuột để tự do xoay 360° quan sát nội thất • Nhấn 'Toàn cảnh' để quay ra ngoài</span>
        `;
      } else if (mode === 'exterior') {
        this.scrollHintEl.innerHTML = `
          <svg class="scroll-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="7"></rect>
            <line x1="12" y1="6" x2="12" y2="10"></line>
          </svg>
          <span>Lăn chuột hoặc vuốt để camera tự động tiến vào nhà theo tuyến đường mặc định (lăn ngược để lùi ra)</span>
        `;
      }
    });

    this.emitter.on<CameraState>('camera:state-changed', (state) => {
      if (state === 'FRONT_DOOR_FOCUS' && !this.currentUser) {
        // Subtle hint when arriving at front door
      }
    });

    // Handle Walk State Changed (6-stage FSM)
    this.emitter.on<import('../types').CameraWalkState>('camera:walk-state-changed', (walkState) => {
      if (walkState === 'INTERIOR_LOOK_AROUND') {
        this.scrollHintEl.innerHTML = `
          <svg class="scroll-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Kéo chuột để quan sát 360° • Dùng WASD hoặc phím mũi tên để đi dạo</span>
        `;
      } else if (walkState === 'RETURNING_OUTSIDE') {
        this.scrollHintEl.innerHTML = `<span>Đang quay hướng nhìn ra cửa thoát...</span>`;
      } else {
        this.scrollHintEl.innerHTML = `
          <svg class="scroll-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="7"></rect>
            <line x1="12" y1="6" x2="12" y2="10"></line>
          </svg>
          <span>Lăn chuột hoặc vuốt để tiến vào nhà (lăn ngược để lùi ra)</span>
        `;
      }
    });

    // Handle furniture item click in the room
    this.emitter.on('furniture:item-inspected', (data: any) => {
      this.currentInspectedItem = data;
      this.showToast(`✨ Đang chọn: ${data.name}`);
      const titleEl = this.furniturePopupEl.querySelector('#furn-item-name');
      const catEl = this.furniturePopupEl.querySelector('#furn-item-category');
      const descEl = this.furniturePopupEl.querySelector('#furn-item-desc');
      if (titleEl) titleEl.textContent = data.name;
      if (catEl && data.category) catEl.textContent = data.category;
      if (descEl && data.description) descEl.textContent = data.description;

      const itemKey = data.itemKey || 'general';
      this.renderItemColors(itemKey);
      this.renderItemMaterials(itemKey);
      this.furniturePopupEl.style.display = 'flex';
    });
  }

  private renderItemColors(itemKey: string): void {
    const container = this.furniturePopupEl.querySelector('#furn-colors-list');
    if (!container) return;
    container.innerHTML = '';

    const colors = this.customizerStore.getColorsForItem(itemKey);
    colors.forEach((col) => {
      const chip = document.createElement('div');
      chip.className = 'color-swatch-chip';
      chip.title = `${col.name} (${col.color})`;
      chip.innerHTML = `
        <span class="color-dot" style="background-color: ${col.color};"></span>
        <span class="color-name">${col.name}</span>
        ${col.isCustom ? '<span style="font-size: 0.65rem; color: #e2b170;">★</span>' : ''}
      `;

      if (col.isCustom) {
        const btnDel = document.createElement('span');
        btnDel.className = 'chip-del-btn';
        btnDel.textContent = '✕';
        btnDel.title = 'Xóa màu tùy chỉnh này';
        btnDel.style.cssText = 'margin-left: 4px; font-size: 0.7rem; color: #ef4444; cursor: pointer; padding: 0 2px;';
        btnDel.addEventListener('click', (e) => {
          e.stopPropagation();
          this.customizerStore.removeColor(itemKey, col.id);
          this.renderItemColors(itemKey);
          this.showToast(`🗑️ Đã xóa màu '${col.name}'`);
        });
        chip.appendChild(btnDel);
      }

      chip.addEventListener('click', () => {
        container.querySelectorAll('.color-swatch-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        this.viewer.furniture.changeInspectedColor(col.color, col.roughness ?? 0.5, col.metalness ?? 0);
        this.showToast(`🎨 Đã áp dụng màu: ${col.name}`);
      });

      container.appendChild(chip);
    });
  }

  private renderItemMaterials(itemKey: string): void {
    const container = this.furniturePopupEl.querySelector('#furn-materials-list');
    if (!container) return;
    container.innerHTML = '';

    const materials = this.customizerStore.getMaterialsForItem(itemKey);
    materials.forEach((mat) => {
      const card = document.createElement('div');
      card.className = 'material-card-chip';
      card.title = mat.name;
      card.style.position = 'relative';

      let thumbContent = '';
      if (mat.thumbUrl || mat.textureDataUrl || mat.textureUrl) {
        thumbContent = `<img class="material-thumb" src="${mat.thumbUrl || mat.textureDataUrl || mat.textureUrl}" alt="${mat.name}">`;
      } else {
        thumbContent = `<div class="material-thumb" style="background: linear-gradient(135deg, #475569, #1e293b); display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">📦</div>`;
      }

      card.innerHTML = `
        ${thumbContent}
        <span class="material-card-name">${mat.name}</span>
      `;

      if (mat.isCustom) {
        const btnDel = document.createElement('span');
        btnDel.textContent = '✕';
        btnDel.title = 'Xóa vật liệu tùy chỉnh này';
        btnDel.style.cssText = 'position: absolute; top: 2px; right: 4px; font-size: 0.72rem; color: #ef4444; background: rgba(0,0,0,0.6); border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2;';
        btnDel.addEventListener('click', (e) => {
          e.stopPropagation();
          this.customizerStore.removeMaterial(itemKey, mat.id);
          this.renderItemMaterials(itemKey);
          this.showToast(`🗑️ Đã xóa vật liệu '${mat.name}'`);
        });
        card.appendChild(btnDel);
      }

      card.addEventListener('click', async () => {
        container.querySelectorAll('.material-card-chip').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        await this.viewer.furniture.changeInspectedMaterial(mat);
        this.showToast(`✨ Đã áp dụng vật liệu: ${mat.name}`);
      });

      container.appendChild(card);
    });
  }

  public showToast(message: string): void {
    const container = this.overlayEl.querySelector('#toast-hint-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-hint';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2b170" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastFadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  public openLoginModal(): void {
    this.modalBackdrop.classList.add('open');
  }

  public closeLoginModal(): void {
    this.modalBackdrop.classList.remove('open');
  }

  private handleLoginSuccess(name: string, email: string): void {
    this.currentUser = { name, email };
    this.closeLoginModal();

    this.userStateEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div class="brand-logo-badge glass-panel" style="padding: 6px 14px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span style="font-size: 0.8rem; font-weight: 600; color: #ffffff;">${name}</span>
        </div>
      </div>
    `;

    this.emitter.emit('auth:login-success', this.currentUser);
  }
}
