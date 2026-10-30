import { BuilderState } from '../state/BuilderState';
import { MediaLibraryModal } from '../../media-manager/components/MediaLibraryModal';
import { MediaManagerService } from '../../media-manager/core/MediaManagerService';
import { PageStorageService } from '../../shared/utils/storageUtils';
import { DomUtils } from '../../shared/utils/domUtils';

export class BuilderToolbar {
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
    const bar = DomUtils.createElement('header', 'builder-toolbar');
    bar.innerHTML = `
      <div class="toolbar-left">
        <div class="toolbar-brand">
          <span class="toolbar-logo-badge">PRO</span>
          <span class="toolbar-title">RealWeb Builder</span>
        </div>

        <div class="toolbar-mode-switch">
          <button class="mode-btn ${!this.state.isEditMode ? 'active' : ''}" id="btn-mode-preview">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Live Preview</span>
          </button>
          <button class="mode-btn ${this.state.isEditMode ? 'active' : ''}" id="btn-mode-edit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>Design Edit</span>
          </button>
        </div>
      </div>

      <div class="toolbar-center">
        <div class="device-switcher">
          <button class="device-btn ${this.state.currentDevice === 'desktop' ? 'active' : ''}" data-dev="desktop" title="Desktop View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </button>
          <button class="device-btn ${this.state.currentDevice === 'tablet' ? 'active' : ''}" data-dev="tablet" title="Tablet View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </button>
          <button class="device-btn ${this.state.currentDevice === 'mobile' ? 'active' : ''}" data-dev="mobile" title="Mobile View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="toolbar-right">
        <button class="tb-btn" id="btn-open-media" title="Thư viện tài nguyên">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>Media</span>
        </button>

        <button class="tb-btn" id="btn-export-json" title="Xuất tệp JSON">Xuất JSON</button>
        <button class="tb-btn" id="btn-save-draft" title="Lưu nháp">Lưu Nháp</button>
        <button class="tb-btn btn-publish" id="btn-publish" title="Xuất bản chính thức">Xuất Bản</button>
      </div>
    `;

    return bar;
  }

  private bindEvents(): void {
    // Mode toggle
    const btnPreview = this.element.querySelector('#btn-mode-preview');
    const btnEdit = this.element.querySelector('#btn-mode-edit');

    btnPreview?.addEventListener('click', () => {
      this.state.setEditMode(false);
      btnPreview.classList.add('active');
      btnEdit?.classList.remove('active');
    });

    btnEdit?.addEventListener('click', () => {
      this.state.setEditMode(true);
      btnEdit.classList.add('active');
      btnPreview?.classList.remove('active');
    });

    // Devices
    this.element.querySelectorAll('.device-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const dev = (e.currentTarget as HTMLElement).dataset.dev as any;
        this.state.setDevice(dev);
        this.element.querySelectorAll('.device-btn').forEach((b) => b.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
      });
    });

    // Media modal
    this.element.querySelector('#btn-open-media')?.addEventListener('click', () => {
      this.mediaModal.open();
    });

    // Export JSON
    this.element.querySelector('#btn-export-json')?.addEventListener('click', () => {
      PageStorageService.exportJson(this.state.page);
    });

    // Save Draft
    this.element.querySelector('#btn-save-draft')?.addEventListener('click', () => {
      const ok = this.state.saveDraft();
      alert(ok ? 'Đã lưu bản nháp thành công!' : 'Lưu bản nháp thất bại.');
    });

    // Publish
    this.element.querySelector('#btn-publish')?.addEventListener('click', () => {
      const ok = this.state.publish();
      alert(ok ? 'Đã xuất bản trang thành công!' : 'Xuất bản thất bại, vui lòng kiểm tra lỗi schema.');
    });
  }
}

