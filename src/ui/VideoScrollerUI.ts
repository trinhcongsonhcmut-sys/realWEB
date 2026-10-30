/**
 * VideoScrollerUI.ts
 * Pure Cinema Mode: Zero UI overlay.
 * 100% full-screen immersive video with drag-and-drop support.
 */

import { EventEmitter } from '../core/EventEmitter';
import { ScrollMotionEngine } from '../motion/ScrollMotionEngine';
import { VideoScrollerEngine } from '../video/VideoScrollerEngine';
import { VideoMetadata } from '../types';

export class VideoScrollerUI {
  public root: HTMLElement;
  public motion: ScrollMotionEngine;
  public scroller: VideoScrollerEngine;
  public emitter: EventEmitter;

  private dropzoneEl!: HTMLElement;
  private fileInputEl!: HTMLInputElement;

  constructor(
    rootElement: HTMLElement,
    motion: ScrollMotionEngine,
    scroller: VideoScrollerEngine,
    emitter: EventEmitter
  ) {
    this.root = rootElement;
    this.motion = motion;
    this.scroller = scroller;
    this.emitter = emitter;

    this.buildUI();
    this.bindEvents();
  }

  private buildUI(): void {
    const uiContainer = document.createElement('div');
    uiContainer.id = 'scroller-ui-overlay';
    uiContainer.className = 'scroller-ui-overlay';

    // 1. Hidden File Input
    this.fileInputEl = document.createElement('input');
    this.fileInputEl.type = 'file';
    this.fileInputEl.accept = 'video/mp4,video/webm,video/quicktime,video/*';
    this.fileInputEl.style.display = 'none';
    uiContainer.appendChild(this.fileInputEl);

    // 2. Drag & Drop Zone (Only appears when user actively drags a file over window)
    this.dropzoneEl = document.createElement('div');
    this.dropzoneEl.className = 'scroller-dropzone';
    this.dropzoneEl.innerHTML = `
      <div class="dropzone-card">
        <div class="dropzone-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <h2 class="dropzone-title">Thả video vào đây</h2>
      </div>
    `;
    uiContainer.appendChild(this.dropzoneEl);

    this.root.appendChild(uiContainer);
  }

  private bindEvents(): void {
    // Drag & Drop handling (silent and seamless)
    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      window.addEventListener(eventName, preventDefaults, false);
    });

    window.addEventListener('dragenter', () => {
      this.dropzoneEl.classList.add('active', 'drag-active');
    });

    this.dropzoneEl.addEventListener('dragleave', (e: MouseEvent) => {
      if (e.relatedTarget === null || !this.dropzoneEl.contains(e.relatedTarget as Node)) {
        this.dropzoneEl.classList.remove('drag-active', 'active');
      }
    });

    window.addEventListener('drop', (e: DragEvent) => {
      this.dropzoneEl.classList.remove('drag-active', 'active');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.handleSelectedFile(files[0]);
      }
    });

    this.fileInputEl.addEventListener('change', () => {
      if (this.fileInputEl.files && this.fileInputEl.files.length > 0) {
        this.handleSelectedFile(this.fileInputEl.files[0]);
      }
    });

    this.emitter.on('video:loaded', () => {
      this.dropzoneEl.classList.remove('active', 'drag-active');
    });
  }

  private async handleSelectedFile(file: File): Promise<void> {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
      return;
    }
    try {
      await this.scroller.loadVideoFile(file);
      this.dropzoneEl.classList.remove('active');
    } catch {}
  }
}
