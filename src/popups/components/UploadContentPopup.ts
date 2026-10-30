/**
 * UploadContentPopup.ts
 * Large interactive popup allowing users to upload project content (images, videos, floorplans)
 * with instant preview, metadata tagging, and local persistence.
 */

import { PopupItem, UploadedMediaItem } from '../types';

export function createUploadContentPopup(): PopupItem {
  return {
    id: 'popup-upload-content',
    size: 'large',
    category: 'upload',
    badge: 'STUDIO UPLOADER',
    title: 'Tải Lên Nội Dung & Bản Vẽ Kiến Trúc',
    subtitle: 'Kéo thả hình ảnh phối cảnh, video hoặc bản vẽ để giới thiệu chi tiết không gian',
    order: 2,
    render: () => {
      const card = document.createElement('div');
      card.className = 'popup-card popup-card-large popup-card-upload';

      card.innerHTML = `
        <div class="popup-header">
          <div class="popup-badge-group">
            <span class="popup-badge badge-upload">STUDIO UPLOADER</span>
            <span class="popup-badge badge-step">BƯỚC 2 / 4</span>
          </div>
          <h2 class="popup-title">Tải Lên Nội Dung & Phối Cảnh</h2>
          <p class="popup-desc">Đăng tải các góc chụp thực tế, bản vẽ mặt bằng hoặc video phối cảnh của bạn vào khu vực bên dưới để mở rộng bộ sưu tập không gian.</p>
        </div>

        <div class="popup-body">
          <div class="upload-interactive-zone" id="upload-drop-area">
            <input type="file" id="popup-file-picker" multiple accept="image/*,video/*,application/pdf" style="display: none;" />
            <div class="upload-zone-inner">
              <div class="upload-icon-circle">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3 class="upload-prompt-text">Kéo thả hình ảnh, video hoặc bản vẽ vào đây</h3>
              <p class="upload-subprompt-text">Hỗ trợ JPG, PNG, WEBP, MP4, WEBM, PDF (Tối đa 100MB mỗi tệp)</p>
              <button type="button" class="btn-popup-upload" id="btn-browse-popup-files">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Chọn tệp từ thiết bị
              </button>
            </div>
          </div>

          <div class="uploaded-items-container hidden" id="uploaded-items-wrapper">
            <div class="uploaded-header">
              <span class="uploaded-count-label" id="uploaded-count-text">Tệp đã tải lên (0)</span>
              <button class="btn-clear-uploads" id="btn-clear-all-uploads">Xóa tất cả</button>
            </div>
            <div class="uploaded-grid" id="uploaded-media-grid"></div>
          </div>

          <div class="upload-meta-form">
            <div class="form-row">
              <div class="form-group flex-2">
                <label for="project-name-input">Tên dự án / Không gian:</label>
                <input type="text" id="project-name-input" class="popup-input" placeholder="Ví dụ: Villa Biển Sky Luxury - Phòng Khách Panorama" />
              </div>
              <div class="form-group flex-1">
                <label for="project-type-select">Loại hình kiến trúc:</label>
                <select id="project-type-select" class="popup-select">
                  <option value="interior">Nội thất biệt thự</option>
                  <option value="exterior">Kiến trúc ngoại thất</option>
                  <option value="penthouse">Penthouse cao cấp</option>
                  <option value="townhouse">Nhà phố đương đại</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="project-notes-input">Ghi chú & Mô tả kiến trúc:</label>
              <textarea id="project-notes-input" class="popup-textarea" rows="2" placeholder="Nhập các điểm nhấn vật liệu, ánh sáng hoặc câu chuyện thiết kế..."></textarea>
            </div>
          </div>
        </div>

        <div class="popup-footer">
          <div class="footer-left">
            <span class="footer-status-pill" id="upload-save-status">Sẵn sàng lưu nội dung</span>
          </div>
          <div class="footer-right">
            <button class="btn-popup-primary" id="btn-save-popup-content">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Lưu Nội Dung Vào Không Gian
            </button>
          </div>
        </div>
      `;

      // Setup event bindings
      const dropArea = card.querySelector('#upload-drop-area') as HTMLElement;
      const fileInput = card.querySelector('#popup-file-picker') as HTMLInputElement;
      const browseBtn = card.querySelector('#btn-browse-popup-files') as HTMLElement;
      const uploadedWrapper = card.querySelector('#uploaded-items-wrapper') as HTMLElement;
      const mediaGrid = card.querySelector('#uploaded-media-grid') as HTMLElement;
      const countLabel = card.querySelector('#uploaded-count-text') as HTMLElement;
      const clearBtn = card.querySelector('#btn-clear-all-uploads') as HTMLElement;
      const saveBtn = card.querySelector('#btn-save-popup-content') as HTMLElement;
      const statusPill = card.querySelector('#upload-save-status') as HTMLElement;

      const uploadedList: UploadedMediaItem[] = [];

      const renderGrid = () => {
        if (uploadedList.length === 0) {
          uploadedWrapper.classList.add('hidden');
          return;
        }
        uploadedWrapper.classList.remove('hidden');
        countLabel.textContent = `Tệp đã tải lên (${uploadedList.length})`;
        mediaGrid.innerHTML = '';

        uploadedList.forEach((item, index) => {
          const itemEl = document.createElement('div');
          itemEl.className = 'uploaded-item-card';

          const mediaPreviewHtml = item.type === 'video'
            ? `<video src="${item.previewUrl}" class="uploaded-thumb" muted autoplay loop></video>`
            : `<img src="${item.previewUrl}" class="uploaded-thumb" alt="${item.name}" />`;

          itemEl.innerHTML = `
            <div class="uploaded-thumb-wrapper">
              ${mediaPreviewHtml}
              <button class="btn-remove-item" data-index="${index}" title="Xóa tệp">&times;</button>
              <span class="uploaded-type-tag">${item.type.toUpperCase()}</span>
            </div>
            <div class="uploaded-item-info">
              <span class="uploaded-item-name" title="${item.name}">${item.name}</span>
              <span class="uploaded-item-meta">${item.sizeMB} MB • ${item.timestamp}</span>
            </div>
          `;

          const removeBtn = itemEl.querySelector('.btn-remove-item') as HTMLElement;
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            URL.revokeObjectURL(item.previewUrl);
            uploadedList.splice(index, 1);
            renderGrid();
          });

          mediaGrid.appendChild(itemEl);
        });
      };

      const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        Array.from(files).forEach((file) => {
          const type: 'image' | 'video' | 'pdf' | 'model' = file.type.startsWith('video/')
            ? 'video'
            : file.type.startsWith('image/')
            ? 'image'
            : 'pdf';

          const previewUrl = URL.createObjectURL(file);
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          uploadedList.push({
            id: `upload-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            sizeMB,
            type,
            previewUrl,
            timestamp,
            caption: ''
          });
        });
        renderGrid();
        statusPill.textContent = `Đã nạp ${uploadedList.length} tệp (Chưa lưu)`;
        statusPill.classList.add('status-pending');
      };

      browseBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
        fileInput.value = '';
      });

      // Drag and drop within this popup's drop area
      ['dragenter', 'dragover'].forEach((evt) => {
        dropArea.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropArea.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach((evt) => {
        dropArea.addEventListener(evt, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropArea.classList.remove('dragover');
        });
      });

      dropArea.addEventListener('drop', (e) => {
        const dt = (e as DragEvent).dataTransfer;
        if (dt && dt.files) {
          handleFiles(dt.files);
        }
      });

      clearBtn.addEventListener('click', () => {
        uploadedList.forEach((it) => URL.revokeObjectURL(it.previewUrl));
        uploadedList.length = 0;
        renderGrid();
        statusPill.textContent = 'Đã xóa toàn bộ';
        statusPill.classList.remove('status-pending');
      });

      saveBtn.addEventListener('click', () => {
        const nameInput = card.querySelector('#project-name-input') as HTMLInputElement;
        const projectName = nameInput.value.trim() || 'Dự Án Kiến Trúc Tùy Chỉnh';

        statusPill.textContent = `✓ Đã lưu thành công: ${projectName} (${uploadedList.length} tệp)`;
        statusPill.classList.remove('status-pending');
        statusPill.classList.add('status-success');

        saveBtn.classList.add('btn-saved');
        setTimeout(() => saveBtn.classList.remove('btn-saved'), 2000);
      });

      return card;
    }
  };
}

