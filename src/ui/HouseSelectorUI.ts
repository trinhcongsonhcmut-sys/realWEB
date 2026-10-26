import { EventEmitter } from '../core/EventEmitter';
import { RealEstateViewer } from '../core/RealEstateViewer';
import { HOUSES_REGISTRY } from '../presets/houses';
import { HousePreset } from '../types/house.types';

export class HouseSelectorUI {
  private container: HTMLElement;
  private viewer: RealEstateViewer;
  private emitter: EventEmitter;
  private dropdownElement!: HTMLElement;

  constructor(parent: HTMLElement, viewer: RealEstateViewer, emitter: EventEmitter) {
    this.container = parent;
    this.viewer = viewer;
    this.emitter = emitter;

    this.render();
  }

  private render(): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'house-selector-wrapper';
    wrapper.innerHTML = `
      <div class="glass-panel house-selector-panel">
        <div class="selector-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Mẫu Kiến Trúc:</span>
        </div>
        <select id="house-preset-select" class="house-dropdown">
          ${Object.values(HOUSES_REGISTRY)
            .map(
              (h: HousePreset) => `
            <option value="${h.id}">${h.title}</option>
          `
            )
            .join('')}
        </select>
      </div>
    `;

    this.container.appendChild(wrapper);

    const select = wrapper.querySelector('#house-preset-select') as HTMLSelectElement;
    if (select) {
      select.addEventListener('change', async (e) => {
        const val = (e.target as HTMLSelectElement).value;
        await this.viewer.switchHouse(val);
      });
    }

    this.emitter.on('house:preset-changed', (preset: HousePreset) => {
      if (select && select.value !== preset.id) {
        select.value = preset.id;
      }
    });
  }
}
