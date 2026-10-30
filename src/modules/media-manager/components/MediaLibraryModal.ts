import { MediaAssetSchema } from '../../shared/schemas/page.types';
import { MediaManagerService } from '../core/MediaManagerService';
import { DomUtils } from '../../shared/utils/domUtils';

export class MediaLibraryModal {
  private service: MediaManagerService;
  private modalEl: HTMLElement | null = null;
  private activeCategory: 'all' | 'image' | 'video' | 'model' | 'document' = 'all';
  private onSelectCallback?: (asset: MediaAssetSchema) => void;

  constructor(service: MediaManagerService) {
    this.service = service;
  }

  public open(options?: {
    filterType?: 'image' | 'video' | 'model' | 'document';
    onSelect?: (asset: MediaAssetSchema) => void;
  }): void {
    this.onSelectCallback = options?.onSelect;
    if (options?.filterType) {
      this.activeCategory = options.filterType;
    }

    if (this.modalEl) {
      this.modalEl.remove();
    }

    this.modalEl = this.render();
    document.body.appendChild(this.modalEl);
  }

  public close(): void {
    if (this.modalEl) {
      this.modalEl.classList.remove('modal-active');
      setTimeout(() => {
        this.modalEl?.remove();
        this.modalEl = null;
      }, 250);
    }
  }

  private render(): HTMLElement {
    const overlay = DomUtils.createElement('div', 'media-modal-overlay');

    const dialog = DomUtils.createElement('div', 'media-modal-dialog');
    dialog.innerHTML = `
      <div class="media-modal-header">
        <div class="media-header-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span class="media-modal-title">Thư Viện Tài Nguyên Đa Phương Tiện (Media Manager)</span>
        </div>
        <button class="media-modal-close" id="btn-close-media">&times;</button>
      </div>

      <div class="media-modal-body">
        <div class="media-modal-toolbar">
          <div class="media-filter-tabs">
            <button class="media-tab-btn ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all">Tất cả</button>
            <button class="media-tab-btn ${this.activeCategory === 'image' ? 'active' : ''}" data-cat="image">Hình ảnh</button>
            <button class="media-tab-btn ${this.activeCategory === 'video' ? 'active' : ''}" data-cat="video">Video</button>
            <button class="media-tab-btn ${this.activeCategory === 'model' ? 'active' : ''}" data-cat="model">Mô hình 3D (GLB)</button>
            <button class="media-tab-btn ${this.activeCategory === 'document' ? 'active' : ''}" data-cat="document">Tài liệu (PDF)</button>
          </div>

          <label class="media-upload-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Tải Lên Mới</span>
            <input type="file" id="media-file-input" style="display:none;" multiple accept="image/*,video/*,.glb,.gltf,.pdf">
          </label>
        </div>

        <div class="media-dropzone" id="media-dropzone">
          <div class="media-dropzone-inner">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5">
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
              <path d="M12 12v9"/>
              <path d="m16 16-4-4-4 4"/>
            </svg>
            <p>Kéo và thả tệp ảnh, video, GLB hoặc tài liệu PDF vào đây</p>
          </div>
        </div>

        <div class="media-assets-grid" id="media-grid"></div>
      </div>
    `;

    overlay.appendChild(dialog);

    // Event listeners
    dialog.querySelector('#btn-close-media')?.addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    // Filter tabs
    dialog.querySelectorAll('.media-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const cat = (e.currentTarget as HTMLElement).dataset.cat as any;
        this.activeCategory = cat;
        dialog.querySelectorAll('.media-tab-btn').forEach((b) => b.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
        this.refreshGrid(dialog);
      });
    });

    // File input change
    const fileInput = dialog.querySelector('#media-file-input') as HTMLInputElement;
    fileInput?.addEventListener('change', async () => {
      if (fileInput.files) {
        await this.handleFiles(fileInput.files, dialog);
      }
    });

    // Drag-and-drop
    const dropzone = dialog.querySelector('#media-dropzone') as HTMLElement;
    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone?.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer?.files) {
        await this.handleFiles(e.dataTransfer.files, dialog);
      }
    });

    // Initial render grid
    this.refreshGrid(dialog);

    setTimeout(() => overlay.classList.add('modal-active'), 10);
    return overlay;
  }

  private async handleFiles(files: FileList, dialog: HTMLElement): Promise<void> {
    for (let i = 0; i < files.length; i++) {
      await this.service.uploadFile(files[i]);
    }
    this.refreshGrid(dialog);
  }

  private refreshGrid(dialog: HTMLElement): void {
    const grid = dialog.querySelector('#media-grid') as HTMLElement;
    if (!grid) return;
    grid.innerHTML = '';

    const filter = this.activeCategory === 'all' ? undefined : this.activeCategory;
    const assets = this.service.getAssets(filter);

    if (assets.length === 0) {
      grid.innerHTML = `
        <div class="media-empty">
          <p>Chưa có tài nguyên nào trong mục này.</p>
        </div>
      `;
      return;
    }

    assets.forEach((asset) => {
      const card = DomUtils.createElement('div', 'media-asset-card');
      card.innerHTML = `
        <div class="media-preview-box">
          ${this.getPreviewHtml(asset)}
          <span class="media-badge media-badge-${asset.type}">${asset.type.toUpperCase()}</span>
        </div>
        <div class="media-asset-info">
          <div class="media-asset-name" title="${asset.name}">${asset.name}</div>
          <div class="media-asset-meta">${this.formatFileSize(asset.size)}</div>
        </div>
        <div class="media-asset-actions">
          <button class="btn-select-asset" title="Chọn tài nguyên này">Chọn</button>
          <button class="btn-del-asset" title="Xóa tài nguyên">&times;</button>
        </div>
      `;

      card.querySelector('.btn-select-asset')?.addEventListener('click', () => {
        if (this.onSelectCallback) {
          this.onSelectCallback(asset);
          this.close();
        }
      });

      card.querySelector('.btn-del-asset')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Bạn có chắc chắn muốn xóa tài nguyên "${asset.name}"?`)) {
          await this.service.deleteAsset(asset.id);
          this.refreshGrid(dialog);
        }
      });

      grid.appendChild(card);
    });
  }

  private getPreviewHtml(asset: MediaAssetSchema): string {
    if (asset.type === 'image') {
      return `<img src="${asset.url}" alt="${asset.name}" class="media-thumb-img" loading="lazy" />`;
    }
    if (asset.type === 'video') {
      return `
        <div class="media-thumb-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      `;
    }
    if (asset.type === 'model') {
      return `
        <div class="media-thumb-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
      `;
    }
    return `
      <div class="media-thumb-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </div>
    `;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

