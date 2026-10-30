import { BuilderState } from '../state/BuilderState';
import { BlockRegistry } from '../../popup-blocks';
import { DomUtils } from '../../shared/utils/domUtils';
import { BlockType } from '../../shared/schemas/page.types';

export class BuilderSidebar {
  public state: BuilderState;
  public element: HTMLElement;

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

      <div class="sidebar-sections-tree" id="sections-tree"></div>

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
    const tree = this.element.querySelector('#sections-tree');
    if (!tree) return;
    tree.innerHTML = '';

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

      // Header click selects section and smoothly scrolls canvas
      secItem.querySelector('.tree-sec-header')?.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-tool-del-sec')) return;
        this.state.selectSection(sec.id);
        this.updateTree();
      });

      // Delete section
      secItem.querySelector('.btn-tool-del-sec')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Bạn có chắc muốn xóa "${sec.title}"?`)) {
          this.state.deleteSection(sec.id);
        }
      });

      // Render blocks
      const blkList = secItem.querySelector(`#blocks-list-${sec.id}`) as HTMLElement;
      sec.blocks.forEach((blk) => {
        const blkItem = DomUtils.createElement(
          'div',
          `tree-block-item ${this.state.activeBlockId === blk.id ? 'active' : ''} ${!blk.enabled ? 'block-disabled' : ''}`
        );
        blkItem.dataset.sidebarBlockId = blk.id;

        blkItem.innerHTML = `
          <div class="blk-meta">
            <span class="blk-type-tag">${blk.type}</span>
            <span class="blk-name">${blk.title}</span>
          </div>
          <div class="blk-actions">
            <button class="btn-blk-clone" data-id="${blk.id}" title="Nhân bản block">&#10697;</button>
            <button class="btn-blk-vis" data-id="${blk.id}" title="Ẩn/Hiện">${blk.enabled ? '👁' : '🚫'}</button>
            <button class="btn-blk-del" data-id="${blk.id}" title="Xóa block">&times;</button>
          </div>
        `;

        // Click block selects it and scrolls to it
        blkItem.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).closest('.blk-actions')) return;
          this.state.selectBlock(blk.id, sec.id);
        });

        blkItem.querySelector('.btn-blk-clone')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.state.cloneBlock(blk.id);
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

  private bindEvents(): void {
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
        case 'specifications': return '🏛️';
        case 'map': return '📍';
        case 'comparison': return '🔄';
        case 'model-3d': return '📦';
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
