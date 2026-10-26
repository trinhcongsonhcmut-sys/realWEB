import { EventEmitter } from '../core/EventEmitter';
import { RealEstateViewer } from '../core/RealEstateViewer';
import { CameraWaypointConfig } from '../types/camera.types';

export class WaypointTunerUI {
  private container: HTMLElement;
  private viewer: RealEstateViewer;
  private emitter: EventEmitter;
  private panelElement!: HTMLElement;

  constructor(parent: HTMLElement, viewer: RealEstateViewer, emitter: EventEmitter) {
    this.container = parent;
    this.viewer = viewer;
    this.emitter = emitter;

    this.render();
  }

  private render(): void {
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'waypoint-tuner-panel glass-panel';
    this.panelElement.innerHTML = `
      <div class="tuner-header">
        <span class="tuner-title">🎥 Tùy Biến Đường Camera</span>
        <button id="btn-toggle-flight" class="btn-tuner-toggle">Bật Bay Tự Do (WASD)</button>
      </div>
      <div id="tuner-body" class="tuner-body hidden">
        <div class="tuner-instructions">
          • Phím <b>W/A/S/D</b>: Di chuyển | <b>Chuột</b>: Xoay góc<br>
          • Phím <b>Space/C</b>: Lên/Xuống | Phím <b>P</b>: Lưu điểm
        </div>
        <div class="tuner-actions">
          <button id="btn-record-point" class="btn-action primary">📍 Lưu Điểm (P)</button>
          <button id="btn-test-path" class="btn-action success">▶ Chạy Thử Lăn Chuột</button>
          <button id="btn-clear-path" class="btn-action danger">🗑 Xóa Hết</button>
        </div>
        <div class="waypoints-list-container">
          <div class="waypoints-header">Danh sách điểm (<span id="wp-count">0</span>):</div>
          <div id="waypoints-list" class="waypoints-list"></div>
        </div>
        <button id="btn-export-json" class="btn-action export">📋 Sao Chép Cấu Hình JSON</button>
      </div>
    `;

    this.container.appendChild(this.panelElement);
    this.bindEvents();
  }

  private bindEvents(): void {
    const btnToggle = this.panelElement.querySelector('#btn-toggle-flight') as HTMLButtonElement;
    const tunerBody = this.panelElement.querySelector('#tuner-body') as HTMLElement;
    const btnRecord = this.panelElement.querySelector('#btn-record-point') as HTMLButtonElement;
    const btnTest = this.panelElement.querySelector('#btn-test-path') as HTMLButtonElement;
    const btnClear = this.panelElement.querySelector('#btn-clear-path') as HTMLButtonElement;
    const btnExport = this.panelElement.querySelector('#btn-export-json') as HTMLButtonElement;
    const listEl = this.panelElement.querySelector('#waypoints-list') as HTMLElement;
    const countEl = this.panelElement.querySelector('#wp-count') as HTMLElement;

    btnToggle.addEventListener('click', () => {
      const isFree = this.viewer.waypointRecorder.toggleFreeFlight();
      if (isFree) {
        btnToggle.textContent = 'Tắt Bay Tự Do';
        btnToggle.classList.add('active');
        tunerBody.classList.remove('hidden');
      } else {
        btnToggle.textContent = 'Bật Bay Tự Do (WASD)';
        btnToggle.classList.remove('active');
        tunerBody.classList.add('hidden');
      }
    });

    btnRecord.addEventListener('click', () => {
      this.viewer.waypointRecorder.captureCurrentPoint();
    });

    btnTest.addEventListener('click', () => {
      this.viewer.waypointRecorder.testRecordedPath();
      btnToggle.textContent = 'Bật Bay Tự Do (WASD)';
      btnToggle.classList.remove('active');
      tunerBody.classList.add('hidden');
    });

    btnClear.addEventListener('click', () => {
      this.viewer.waypointRecorder.clearPoints();
    });

    btnExport.addEventListener('click', () => {
      const json = this.viewer.waypointRecorder.exportConfigCode();
      navigator.clipboard.writeText(json).then(() => {
        alert('Đã sao chép cấu hình Waypoints vào bộ nhớ tạm (Clipboard)!');
      });
    });

    this.emitter.on('recorder:waypoints-updated', (wps: CameraWaypointConfig[]) => {
      countEl.textContent = wps.length.toString();
      listEl.innerHTML = wps
        .map(
          (wp, idx) => `
        <div class="wp-item">
          <span><b>P${idx + 1}:</b> [${wp.position.join(', ')}]</span>
          <button class="btn-del-wp" data-idx="${idx}">✕</button>
        </div>
      `
        )
        .join('');

      listEl.querySelectorAll('.btn-del-wp').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt((e.target as HTMLElement).getAttribute('data-idx') || '0', 10);
          this.viewer.waypointRecorder.deletePoint(idx);
        });
      });
    });
  }
}
