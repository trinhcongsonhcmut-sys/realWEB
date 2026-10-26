import './styles/main.css';
import { EventEmitter } from './core/EventEmitter';
import { RealEstateViewer } from './core/RealEstateViewer';
import { UIController } from './ui/UIController';
import { SAMPLE_PROPERTY } from './data/sampleProperty';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  const loadingScreen = document.getElementById('loading-screen');

  if (!container) {
    console.error('Canvas container not found');
    return;
  }

  // 1. Initialize Event Bus
  const emitter = new EventEmitter();

  // 2. Initialize 3D Real Estate Engine
  const viewer = new RealEstateViewer(container, SAMPLE_PROPERTY, emitter);

  // 3. Initialize Modern UI Controller
  const ui = new UIController(document.getElementById('app')!, SAMPLE_PROPERTY, emitter, viewer);

  // 4. Hide loading screen when ready
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }, 350);

  // Debug reference for testing if needed
  (window as any).__viewer = viewer;
  (window as any).__ui = ui;
});
