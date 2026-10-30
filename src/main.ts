/**
 * main.ts
 * Main entry point for RealWeb Modular Scrolling Experience & Dynamic Popup Page Builder.
 * Integrates 6 independent modules:
 * 1. three-d-viewer
 * 2. scrolling-page
 * 3. popup-blocks
 * 4. page-builder
 * 5. media-manager
 * 6. shared
 */

import './styles/main.css';
import './modules/popup-blocks';
import { EventEmitter } from './modules/shared/events/EventEmitter';
import { PageStorageService } from './modules/shared/utils/storageUtils';
import { DEFAULT_PAGE_SCHEMA } from './data/defaultPageSchema';
import { PageBuilderApp } from './modules/page-builder/components/PageBuilderApp';
import { DomUtils } from './modules/shared/utils/domUtils';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error('[RealWeb] Container #app not found');
    return;
  }

  // 1. Initialize global Event Bus
  const emitter = new EventEmitter();

  // 2. Load draft/published page or seed default
  let currentPage = PageStorageService.loadDraft(DEFAULT_PAGE_SCHEMA.id);
  if (!currentPage) {
    currentPage = DEFAULT_PAGE_SCHEMA;
    PageStorageService.saveDraft(DEFAULT_PAGE_SCHEMA);
  } else {
    // Ensure backwards compatibility for text blocks loaded from previous sessions
    currentPage.sections?.forEach((sec) => {
      sec.blocks?.forEach((blk) => {
        if (blk.type === 'text' && blk.content) {
          if (!blk.content.fontSize) blk.content.fontSize = '16px';
          if (!blk.content.fontWeight) blk.content.fontWeight = '400';
          if (!blk.content.textColor) blk.content.textColor = '#ffffff';
          if (!blk.content.fontFamily) blk.content.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        }
      });
    });
  }

  // 3. Initialize Page Builder Application
  const builderApp = new PageBuilderApp(currentPage, emitter);
  builderApp.mount(appContainer);

  // 4. Render Mode Switcher Floating Pill (bottom right)
  const floatingPill = DomUtils.createElement('div', 'mode-toggle-floating-pill');
  floatingPill.innerHTML = `
    <button class="mode-pill-btn active" id="pill-btn-live" title="Xem trải nghiệm người dùng thực tế">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <span>Trải Nghiệm Live</span>
    </button>
    <button class="mode-pill-btn" id="pill-btn-builder" title="Mở trình quản trị kéo thả Pop-up">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
      <span>Page Builder</span>
    </button>
  `;
  document.body.appendChild(floatingPill);

  const btnLive = floatingPill.querySelector('#pill-btn-live') as HTMLElement;
  const btnBuilder = floatingPill.querySelector('#pill-btn-builder') as HTMLElement;
  const sidebar = builderApp.sidebar.element;
  const propsPanel = builderApp.propertiesPanel.element;
  const toolbar = builderApp.toolbar.element;

  // Initially: Live View mode (hide sidebar & props, show canvas full screen)
  const setLiveView = () => {
    builderApp.state.setEditMode(false);
    sidebar.style.display = 'none';
    propsPanel.style.display = 'none';
    toolbar.style.display = 'none';
    builderApp.canvas.viewportFrame.className = 'builder-viewport-frame frame-desktop';
    btnLive.classList.add('active');
    btnBuilder.classList.remove('active');
  };

  const setBuilderView = () => {
    builderApp.state.setEditMode(true);
    sidebar.style.display = '';
    propsPanel.style.display = '';
    toolbar.style.display = '';
    btnBuilder.classList.add('active');
    btnLive.classList.remove('active');
  };

  btnLive.addEventListener('click', setLiveView);
  btnBuilder.addEventListener('click', setBuilderView);

  // Default to Live View for immediate smooth scrolling test
  setLiveView();

  console.log('[RealWeb] Modular Scrolling Experience & Page Builder initialized successfully.');
});
