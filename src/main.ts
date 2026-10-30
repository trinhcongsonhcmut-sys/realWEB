/**
 * main.ts
 * Application entrypoint for AURA SCROLL platform.
 * Integrates ScrollMotionEngine, VideoScrollerEngine, VideoScrollerUI, and scalable PopupManager.
 */

import './styles/main.css';
import { EventEmitter } from './core/EventEmitter';
import { ScrollMotionEngine } from './motion/ScrollMotionEngine';
import { VideoScrollerEngine } from './video/VideoScrollerEngine';
import { VideoScrollerUI } from './ui/VideoScrollerUI';
import { PopupManager } from './popups/PopupManager';

document.addEventListener('DOMContentLoaded', async () => {
  const appElement = document.getElementById('app');
  const canvasContainer = document.getElementById('canvas-container');
  const popupsContainer = document.getElementById('popups-container');

  if (!appElement || !canvasContainer) {
    console.error('[AURA SCROLL] Required DOM containers not found');
    return;
  }

  // 1. Initialize Event Bus
  const emitter = new EventEmitter();

  // 2. Initialize Video Scroller Canvas Engine
  const scroller = new VideoScrollerEngine(canvasContainer, emitter);

  // 3. Initialize Scroll Motion Physics Engine
  const motion = new ScrollMotionEngine(emitter);
  motion.bind(window);

  // 4. Initialize Clean Cinema UI (Drag & Drop support)
  const ui = new VideoScrollerUI(appElement, motion, scroller, emitter);

  // 5. Initialize Extensible Popups Manager (RenderAHouse showcase style)
  let popupManager: PopupManager | null = null;
  if (popupsContainer) {
    popupManager = new PopupManager(popupsContainer, emitter);

    // Handover: when user scrolls past the end of the video, glide into the popups section
    emitter.on('scroll:completed', () => {
      popupManager?.scrollIntoPopups();
    });
  }

  // 6. Try high-performance WebP frame sequence first for 60-120 FPS playback
  let isLoaded = false;
  try {
    const frameSuccess = await scroller.loadFrameSequence('/assets/frames/manifest.json');
    if (frameSuccess) {
      console.log('[AURA SCROLL] High-speed WebP frame sequence loaded successfully (60-120 FPS).');
      isLoaded = true;
    }
  } catch {
    // Fallback to direct video file
  }

  // 7. Fallback: check for default video file in public/assets/videos/
  if (!isLoaded) {
    const candidatePaths = [
      '/assets/videos/video_1.mp4',
      '/assets/videos/video.mp4'
    ];
    for (const path of candidatePaths) {
      try {
        const checkRes = await fetch(path, { method: 'HEAD' });
        if (checkRes.ok) {
          const fileName = path.split('/').pop() || 'video.mp4';
          console.log(`[AURA SCROLL] Auto-loading ${fileName}...`);
          await scroller.loadVideoUrl(path, fileName);
          break;
        }
      } catch {
        // Continue to next candidate
      }
    }
  }

  // Debug reference for testing if needed
  (window as any).__scroller = scroller;
  (window as any).__motion = motion;
  (window as any).__ui = ui;
  (window as any).__popupManager = popupManager;

  console.log('[AURA SCROLL] Platform initialized with Extensible Popups System.');
});
