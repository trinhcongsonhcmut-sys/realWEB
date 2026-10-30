import { RealEstateViewer } from '../core/RealEstateViewer';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { HousePreset, CameraPathPreset, Hotspot } from '../schemas/3d.types';
import { DomUtils } from '../../shared/utils/domUtils';

export class ThreeDViewerComponent {
  public element: HTMLElement;
  public viewer: RealEstateViewer;
  private emitter: EventEmitter;

  constructor(
    emitter: EventEmitter,
    options?: {
      housePreset?: HousePreset;
      pathPreset?: CameraPathPreset;
      hotspots?: Hotspot[];
      className?: string;
    }
  ) {
    this.emitter = emitter;
    this.element = DomUtils.createElement('div', options?.className || 'threed-viewer-container');
    this.element.style.position = 'relative';
    this.element.style.width = '100%';
    this.element.style.height = '100%';
    this.element.style.overflow = 'hidden';

    // Prevent page scroll hijack when interacting directly with 3D canvas
    this.element.addEventListener('pointerenter', () => {
      this.emitter.emit('3d:interacting', true);
    });
    this.element.addEventListener('pointerleave', () => {
      this.emitter.emit('3d:interacting', false);
    });

    this.viewer = new RealEstateViewer(
      this.element,
      this.emitter,
      options?.housePreset,
      options?.pathPreset
    );

    if (options?.hotspots) {
      this.viewer.initHotspots(options.hotspots);
    }
  }

  public dispose(): void {
    this.viewer.dispose();
    this.element.remove();
  }
}

