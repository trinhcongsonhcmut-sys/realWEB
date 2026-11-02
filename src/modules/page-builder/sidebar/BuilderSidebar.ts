import { BuilderState } from '../state/BuilderState';
import { BlockRegistry } from '../../popup-blocks';
import { DomUtils } from '../../shared/utils/domUtils';
import { BlockType } from '../../shared/schemas/page.types';

export class BuilderSidebar {
  public state: BuilderState;
  public element: HTMLElement;
  private activeTab: 'layers' | 'palette' = 'layers';

  constructor(state: BuilderState) {
    this.state = state;
    this.element = this.render();
    this.bindEvents();
  }

  private render(): HTMLElement {
    const sidebar = DomUtils.createElement('aside', 'builder-sidebar');
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Page Structure</span>
        </div>
        <button class="btn-sidebar-add-sec" id="btn-add-section" title="Thêm Section Mới">+ Section</button>
      </div>

      <div class="sidebar-tabs">
        <button class="btn-sidebar-tab ${this.activeTab === 'layers' ? 'active' : ''}" data-tab="layers">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </svg>
          <span>Lớp (Layers)</span>
        </button>
        <button class="btn-sidebar-tab ${this.activeTab === 'palette' ? 'active' : ''}" data-tab="palette">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>+ Khối (Palette)</span>
        </button>
      </div>

      <div class="sidebar-tab-content" id="sidebar-tab-content" style="flex:1; overflow-y:auto; display:flex; flex-direction:column;">
        <div class="sidebar-sections-tree" id="sections-tree"></div>
        <div class="sidebar-palette-container" id="palette-container" style="display:none;"></div>
      </div>

      <div class="sidebar-footer">
        <button class="btn-add-popup-primary" id="btn-add-popup">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>+ Thêm Pop-up Mới</span>
        </button>
      </div>
    `;

    return sidebar;
  }

  public updateTree(): void {
    const tree = this.element.querySelector('#sections-tree') as HTMLElement;
    const palette = this.element.querySelector('#palette-container') as HTMLElement;
    if (!tree) return;

    if (this.activeTab === 'palette') {
      tree.style.display = 'none';
      if (palette) {
        palette.style.display = 'flex';
        this.renderPalette(palette);
      }
      return;
    }

    tree.style.display = 'block';
    if (palette) palette.style.display = 'none';
    tree.innerHTML = '';

    const getIcon = (type: string) => {
      switch (type) {
        case 'image': return '📸';
        case 'text': return '📝';
        case 'gallery': return '🖼️';
        case 'video': return '🎬';
        case 'info-card': return '💎';
        case 'container': return '📦';
        case 'specifications': return '🏛️';
        case 'map': return '📍';
        case 'comparison': return '🔄';
        case 'model-3d': return '🧊';
        case 'hero-video': return '🎥';
        case 'hero-3d': return '🎮';
        default: return '✨';
      }
    };

    this.state.page.sections.forEach((sec, sIdx) => {
      const secItem = DomUtils.createElement('div', `tree-section-item ${this.state.activeSectionId === sec.id ? 'active' : ''}`);
      secItem.dataset.sectionId = sec.id;

      secItem.innerHTML = `
        <div class="tree-sec-header">
          <span class="sec-index">#${sIdx + 1}</span>
          <span class="sec-title">${sec.title || `Section ${sIdx + 1}`}</span>
          <div class="sec-tools">
            <button class="btn-tool-del-sec" data-id="${sec.id}" title="Xóa Section">&times;</button>
          </div>
        </div>
        <div class="tree-blocks-list" id="blocks-list-${sec.id}"></div>
      `;

      secItem.querySelector('.tree-sec-header')?.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-tool-del-sec')) return;
        this.state.selectSection(sec.id);
        this.updateTree();
      });

      secItem.querySelector('.btn-tool-del-sec')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Bạn có chắc muốn xóa "${sec.title}"?`)) {
          this.state.deleteSection(sec.id);
        }
      });

      // Render blocks inside this section sorted by z-index descending (top layer first)
      const blkList = secItem.querySelector(`#blocks-list-${sec.id}`) as HTMLElement;
      const sortedBlocks = [...sec.blocks].sort((a, b) => (b.layout.zIndex ?? 10) - (a.layout.zIndex ?? 10));

      sortedBlocks.forEach((blk) => {
        const blkItem = DomUtils.createElement(
          'div',
          `tree-block-item ${this.state.activeBlockId === blk.id ? 'active' : ''} ${!blk.enabled ? 'block-disabled' : ''} ${blk.locked ? 'tree-block-locked' : ''}`
        );
        blkItem.dataset.sidebarBlockId = blk.id;

        blkItem.innerHTML = `
          <div class="blk-meta">
            <span class="layer-z-pill" title="Z-Index (Lớp hiển thị)">z:${blk.layout.zIndex ?? 10}</span>
            <span class="blk-icon" style="font-size:12px; margin-right:4px;">${getIcon(blk.type)}</span>
            <span class="blk-name">${blk.title}</span>
          </div>
          <div class="blk-actions">
            <button class="btn-layer-tool btn-blk-up" data-id="${blk.id}" title="Lên 1 lớp (Move Forward)">▲</button>
            <button class="btn-layer-tool btn-blk-down" data-id="${blk.id}" title="Xuống 1 lớp (Move Backward)">▼</button>
            <button class="btn-layer-tool btn-blk-lock" data-id="${blk.id}" title="${blk.locked ? 'Mở khóa' : 'Khóa'}">${blk.locked ? '🔒' : '🔓'}</button>
            <button class="btn-blk-vis" data-id="${blk.id}" title="Ẩn/Hiện">${blk.enabled ? '👁' : '🚫'}</button>
            <button class="btn-blk-del" data-id="${blk.id}" title="Xóa block">&times;</button>
          </div>
        `;

        blkItem.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).closest('.blk-actions')) return;
          this.state.selectBlock(blk.id, sec.id);
        });

        blkItem.querySelector('.btn-blk-up')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.state.moveForward(blk.id);
        });

        blkItem.querySelector('.btn-blk-down')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.state.moveBackward(blk.id);
        });

        blkItem.querySelector('.btn-blk-lock')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.state.lockBlock(blk.id);
        });

        blkItem.querySelector('.btn-blk-vis')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.state.toggleBlockVisibility(blk.id);
        });

        blkItem.querySelector('.btn-blk-del')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Xóa block "${blk.title}"?`)) {
            this.state.deleteBlock(blk.id);
          }
        });

        blkList.appendChild(blkItem);
      });

      tree.appendChild(secItem);
    });
  }

  private renderPalette(container: HTMLElement): void {
    const types = BlockRegistry.getInstance().getAvailableTypes();
    const secId = this.state.activeSectionId || this.state.page.sections[0]?.id;

    const getIcon = (type: string) => {
      switch (type) {
        case 'image': return '📸';
        case 'text': return '📝';
        case 'gallery': return '🖼️';
        case 'video': return '🎬';
        case 'info-card': return '💎';
        case 'container': return '📦';
        case 'specifications': return '🏛️';
        case 'map': return '📍';
        case 'comparison': return '🔄';
        case 'model-3d': return '🧊';
        case 'hero-video': return '🎥';
        case 'hero-3d': return '🎮';
        default: return '✨';
      }
    };

    container.innerHTML = `
      <div style="font-size:11px; color:#94a3b8; margin-bottom:8px; line-height:1.4;">
        Bấm vào một khối để thêm vào <strong>Section đang chọn</strong>:
      </div>
      ${types.map(t => `
        <div class="palette-item-card" data-type="${t.type}">
          <div class="palette-item-icon">${getIcon(t.type)}</div>
          <div class="palette-item-info">
            <span class="palette-item-name">${t.name}</span>
            <span class="palette-item-desc">${t.description}</span>
          </div>
        </div>
      `).join('')}
    `;

    container.querySelectorAll('.palette-item-card').forEach((card) => {
      card.addEventListener('click', () => {
        if (!secId) {
          alert('Vui lòng chọn hoặc thêm một Section trước khi thêm khối.');
          return;
        }
        const type = (card as HTMLElement).dataset.type as BlockType;
        const newBlock = this.state.addBlock(secId, type);

        // Switch back to layers tab and highlight new block
        this.activeTab = 'layers';
        this.element.querySelectorAll('.btn-sidebar-tab').forEach((tab) => {
          tab.classList.toggle('active', (tab as HTMLElement).dataset.tab === 'layers');
        });
        this.updateTree();

        setTimeout(() => {
          this.state.selectBlock(newBlock.id, secId);
        }, 100);
      });
    });
  }

  private bindEvents(): void {
    // Tab switching
    this.element.querySelectorAll('.btn-sidebar-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const targetTab = (e.currentTarget as HTMLElement).dataset.tab as any;
        this.activeTab = targetTab;
        this.element.querySelectorAll('.btn-sidebar-tab').forEach((t) => t.classList.remove('active'));
        (e.currentTarget as HTMLElement).classList.add('active');
        this.updateTree();
      });
    });

    // Add section button
    this.element.querySelector('#btn-add-section')?.addEventListener('click', () => {
      this.state.addSection('full-screen');
    });

    // Add popup modal/dropdown
    this.element.querySelector('#btn-add-popup')?.addEventListener('click', () => {
      this.showAddBlockModal();
    });

    // Open add popup from section bar
    this.state.emitter.on('builder:open-add-popup', (secId?: string) => {
      if (secId) this.state.activeSectionId = secId;
      this.showAddBlockModal();
    });

    this.state.emitter.on('builder:page-updated', () => this.updateTree());
    this.state.emitter.on('builder:selection-changed', () => this.updateTree());
  }

  private showAddBlockModal(): void {
    const secId = this.state.activeSectionId || this.state.page.sections[0]?.id;
    if (!secId) {
      alert('Vui lòng thêm Section trước khi thêm Pop-up');
      return;
    }

    const types = BlockRegistry.getInstance().getAvailableTypes();

    const getIcon = (type: string) => {
      switch (type) {
        case 'image': return '📸';
        case 'text': return '📝';
        case 'gallery': return '🖼️';
        case 'video': return '🎬';
        case 'info-card': return '💎';
        case 'container': return '📦';
        case 'specifications': return '🏛️';
        case 'map': return '📍';
        case 'comparison': return '🔄';
        case 'model-3d': return '🧊';
        case 'hero-video': return '🎥';
        case 'hero-3d': return '🎮';
        default: return '✨';
      }
    };

    const modal = DomUtils.createElement('div', 'add-block-modal-overlay');
    modal.innerHTML = `
      <div class="add-block-dialog">
        <div class="add-block-dialog-header">
          <div class="add-block-header-info">
            <h3>Chọn Loại Khối / Pop-up Mới</h3>
            <span class="add-block-target-sec">Thêm vào Section đang chọn: #${secId}</span>
          </div>
          <button class="close-add-modal">&times;</button>
        </div>
        <div class="add-block-cards-grid">
          ${types
        .map(
          (t) => `
            <div class="add-block-card" data-type="${t.type}">
              <div class="add-block-icon">${getIcon(t.type)}</div>
              <div class="add-block-meta">
                <div class="add-block-name">${t.name}</div>
                <div class="add-block-desc">${t.description}</div>
              </div>
            </div>
          `
        )
        .join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-add-modal')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    modal.querySelectorAll('.add-block-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const type = (e.currentTarget as HTMLElement).dataset.type as BlockType;
        const newBlock = this.state.addBlock(secId, type);
        modal.remove();

        // Auto select and smooth scroll directly to the newly created popup
        setTimeout(() => {
          this.state.selectBlock(newBlock.id, secId);
        }, 100);
      });
    });
  }
}
