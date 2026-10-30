import { BuilderState } from '../state/BuilderState';
import { ScrollingPageEngine } from '../../scrolling-page/core/ScrollingPageEngine';
import { SectionContainer } from '../../scrolling-page/components/SectionContainer';
import { BlockRegistry } from '../../popup-blocks/registry/BlockRegistry';
import { MediaManagerService } from '../../media-manager/core/MediaManagerService';
import { DomUtils } from '../../shared/utils/domUtils';

export class BuilderCanvas {
  public state: BuilderState;
  public element: HTMLElement;
  public viewportFrame: HTMLElement;
  public pageContainer: HTMLElement;
  public scrollEngine?: ScrollingPageEngine;

  constructor(state: BuilderState) {
    this.state = state;
    this.element = DomUtils.createElement('div', 'builder-canvas-area');
    this.viewportFrame = DomUtils.createElement('div', 'builder-viewport-frame frame-desktop');
    this.pageContainer = DomUtils.createElement('div', 'builder-page-container');

    this.viewportFrame.appendChild(this.pageContainer);
    this.element.appendChild(this.viewportFrame);

    this.bindEvents();
    this.renderPage();
  }

  public renderPage(): void {
    if (this.scrollEngine) {
      this.scrollEngine.dispose();
    }
    this.pageContainer.innerHTML = '';

    this.scrollEngine = new ScrollingPageEngine(this.pageContainer, this.state.page, this.state.emitter);
    const registry = BlockRegistry.getInstance();

    this.state.page.sections.forEach((secSchema) => {
      if (!secSchema.enabled) return;

      const secContainer = new SectionContainer(secSchema);

      // In Edit Mode: add section control bar with title & tools
      let secWrap: HTMLElement;
      if (this.state.isEditMode) {
        secWrap = DomUtils.createElement(
          'div',
          `builder-section-item-wrapper ${this.state.activeSectionId === secSchema.id ? 'active-section' : ''}`
        );
        secWrap.dataset.sectionId = secSchema.id;

        const controlBar = DomUtils.createElement('div', 'builder-section-control-bar');
        const currentSecHex = this.extractHexColor(secSchema.layout.background);
        controlBar.innerHTML = `
          <div class="builder-sec-info">
            <span class="builder-sec-badge">Section ${secSchema.order}: ${secSchema.title}</span>
            <span class="builder-sec-type">[${secSchema.type.toUpperCase()}]</span>
          </div>
          <div class="builder-sec-actions-row">
            <label class="btn-sec-color-quick" title="Bấm để chọn màu cầu vồng cho Section">
              <input type="color" class="quick-sec-color-input" value="${currentSecHex}" />
              <span>🎨 Màu nền</span>
            </label>
            <button class="btn-add-pop-to-sec" data-sec="${secSchema.id}">+ Thêm Pop-up</button>
            <button class="btn-del-sec-canvas" data-sec="${secSchema.id}" title="Xóa Section">&times;</button>
          </div>
        `;

        const secColorInput = controlBar.querySelector('.quick-sec-color-input') as HTMLInputElement;
        secColorInput?.addEventListener('input', (e) => {
          e.stopPropagation();
          const newColor = secColorInput.value;
          secSchema.layout.background = newColor;
          secWrap.style.background = newColor;
          secContainer.element.style.background = newColor;
          this.state.emitter.emit('builder:section-bg-changed', { sectionId: secSchema.id, background: newColor });
        });
        secColorInput?.addEventListener('change', (e) => {
          e.stopPropagation();
          this.state.saveSnapshot();
        });

        controlBar.querySelector('.btn-add-pop-to-sec')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.state.selectSection(secSchema.id);
          this.state.emitter.emit('builder:open-add-popup', secSchema.id);
        });

        controlBar.querySelector('.btn-del-sec-canvas')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Xóa "${secSchema.title}"?`)) {
            this.state.deleteSection(secSchema.id);
          }
        });

        secWrap.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).closest('.builder-block-editable')) return;
          this.state.selectSection(secSchema.id);
        });

        secWrap.appendChild(controlBar);
        secWrap.appendChild(secContainer.element);
      } else {
        secWrap = secContainer.element;
      }

      // Render blocks into section
      secSchema.blocks.forEach((blkSchema) => {
        if (!blkSchema.enabled) return;

        try {
          const blockInstance = registry.create(blkSchema, this.state.emitter);
          const blockEl = blockInstance.element;

          // In edit mode: enable drag, drop, and selection
          if (this.state.isEditMode) {
            blockEl.classList.add('builder-block-editable');
            // Force block to be visible in edit mode
            blockEl.classList.add('block-entered');

            if (this.state.activeBlockId === blkSchema.id) {
              blockEl.classList.add('builder-block-selected');
            }

            blockEl.addEventListener('click', (e) => {
              e.stopPropagation();
              this.state.selectBlock(blkSchema.id, secSchema.id);
            });

            // 1. MAKE DRAGGABLE
            const handle = (!blkSchema.styling?.hideHeader && blockEl.querySelector('.popup-drag-handle'))
              ? (blockEl.querySelector('.popup-drag-handle') as HTMLElement)
              : blockEl;

            DomUtils.makeDraggable(
              blockEl,
              handle,
              (curX, curY) => {
                let badge = blockEl.querySelector('.drag-coords-badge') as HTMLElement;
                if (!badge) {
                  badge = DomUtils.createElement('div', 'drag-coords-badge');
                  blockEl.appendChild(badge);
                }
                badge.textContent = `X: ${curX}px, Y: ${curY}px`;
              },
              (finalX, finalY) => {
                blockEl.querySelector('.drag-coords-badge')?.remove();
                blkSchema.layout.position = 'absolute';
                blkSchema.layout.x = `${finalX}px`;
                blkSchema.layout.y = `${finalY}px`;
                this.state.saveSnapshot();
                this.state.emitter.emit('builder:block-updated', blkSchema);
              }
            );

            // 1.5. MAKE RESIZABLE
            DomUtils.makeResizable(
              blockEl,
              (w, h, x, y) => {
                blkSchema.layout.width = `${w}px`;
                blkSchema.layout.height = `${h}px`;
                blkSchema.layout.x = `${x}px`;
                blkSchema.layout.y = `${y}px`;
                this.state.emitter.emit('builder:block-resizing', blkSchema);
              },
              (finalW, finalH, finalX, finalY) => {
                blkSchema.layout.position = 'absolute';
                blkSchema.layout.width = `${finalW}px`;
                blkSchema.layout.height = `${finalH}px`;
                blkSchema.layout.x = `${finalX}px`;
                blkSchema.layout.y = `${finalY}px`;
                this.state.saveSnapshot();
                this.state.emitter.emit('builder:block-updated', blkSchema);
              }
            );

            // 2. FILE DRAG & DROP DIRECTLY ONTO POP-UP
            blockEl.addEventListener('dragover', (e) => {
              e.preventDefault();
              e.stopPropagation();
              blockEl.classList.add('popup-drop-target-active');
            });

            blockEl.addEventListener('dragleave', (e) => {
              e.stopPropagation();
              blockEl.classList.remove('popup-drop-target-active');
            });

            blockEl.addEventListener('drop', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              blockEl.classList.remove('popup-drop-target-active');

              if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                const mediaService = MediaManagerService.getInstance(this.state.emitter);
                const asset = await mediaService.uploadFile(file);

                if (blkSchema.content) {
                  if (asset.type === 'image') {
                    if (blkSchema.content.imageUrl !== undefined) {
                      blkSchema.content.imageUrl = asset.url;
                    } else if (Array.isArray(blkSchema.content.items)) {
                      blkSchema.content.items.unshift({ url: asset.url, title: asset.name });
                    } else {
                      blkSchema.content.imageUrl = asset.url;
                    }
                  } else if (asset.type === 'video') {
                    blkSchema.content.videoUrl = asset.url;
                  } else if (asset.type === 'model') {
                    blkSchema.content.modelUrl = asset.url;
                  }
                }
                this.state.saveSnapshot();
                this.state.emitter.emit('builder:page-updated', this.state.page);
              }
            });
          }

          secContainer.appendBlock(blkSchema, blockEl);
        } catch (err) {
          console.error(`Error rendering block "${blkSchema.id}":`, err);
        }
      });

      this.pageContainer.appendChild(secWrap);
      this.scrollEngine?.registerSectionContainer(secContainer);
    });
  }

  private bindEvents(): void {
    this.state.emitter.on('builder:page-updated', () => this.renderPage());
    this.state.emitter.on('builder:mode-changed', () => this.renderPage());

    this.state.emitter.on('builder:device-changed', (device) => {
      this.viewportFrame.className = `builder-viewport-frame frame-${device}`;
    });

    this.state.emitter.on('builder:text-style-changed', (data: any) => {
      if (!data?.blockId || !data?.styles) return;
      const textEls = this.pageContainer.querySelectorAll<HTMLElement>(
        `.pure-text-content[data-block-id="${data.blockId}"], [data-block-id="${data.blockId}"] .pure-text-content`
      );
      textEls.forEach((el) => {
        if (data.styles.fontFamily !== undefined) el.style.fontFamily = data.styles.fontFamily;
        if (data.styles.fontSize !== undefined) {
          const raw = String(data.styles.fontSize).trim();
          el.style.fontSize = /^\d+(\.\d+)?$/.test(raw) ? `${raw}px` : raw;
        }
        if (data.styles.fontWeight !== undefined) el.style.fontWeight = data.styles.fontWeight;
        if (data.styles.fontStyle !== undefined) el.style.fontStyle = data.styles.fontStyle;
        if (data.styles.textAlign !== undefined) el.style.textAlign = data.styles.textAlign;
        if (data.styles.textColor !== undefined) el.style.color = data.styles.textColor;
        if (data.styles.lineHeight !== undefined) el.style.lineHeight = data.styles.lineHeight;
        if (data.styles.letterSpacing !== undefined) el.style.letterSpacing = data.styles.letterSpacing;
        if (data.styles.textTransform !== undefined) el.style.textTransform = data.styles.textTransform;
      });
    });

    this.state.emitter.on('builder:selection-changed', () => {
      // Highlight selected block
      this.pageContainer.querySelectorAll('.builder-block-editable').forEach((el) => {
        const id = (el as HTMLElement).dataset.blockId;
        if (id === this.state.activeBlockId) {
          el.classList.add('builder-block-selected');
        } else {
          el.classList.remove('builder-block-selected');
        }
      });

      // Highlight active section wrapper
      this.pageContainer.querySelectorAll('.builder-section-item-wrapper').forEach((el) => {
        const id = (el as HTMLElement).dataset.sectionId;
        if (id === this.state.activeSectionId) {
          el.classList.add('active-section');
        } else {
          el.classList.remove('active-section');
        }
      });

      // Smooth scroll canvas to bring selected block or section into center view
      if (this.state.activeBlockId) {
        const targetEl = this.pageContainer.querySelector(`[data-block-id="${this.state.activeBlockId}"]`) as HTMLElement;
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (this.state.activeSectionId) {
        const secEl = this.pageContainer.querySelector(`[data-section-id="${this.state.activeSectionId}"]`) as HTMLElement;
        if (secEl) {
          secEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  private extractHexColor(bg?: string): string {
    if (!bg) return '#0d1117';
    if (bg.startsWith('#') && (bg.length === 7 || bg.length === 4)) return bg;
    const hexMatch = bg.match(/#[0-9a-fA-F]{6}/);
    if (hexMatch) return hexMatch[0];
    return '#0d1117';
  }
}
