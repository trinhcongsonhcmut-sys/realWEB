import { BaseBlock } from '../base/BaseBlock';
import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { ThreeDViewerComponent } from '../../three-d-viewer/components/ThreeDViewerComponent';
import { MY_HOUSING_COMPOSITE_PRESET, MY_HOUSING_WALKTHROUGH_PATH, SAMPLE_PROPERTY } from '../../three-d-viewer/presets/default3DPresets';
import { DomUtils } from '../../shared/utils/domUtils';

export interface Hero3DContent {
  modelUrl?: string;
  title?: string;
  enableWalkthrough?: boolean;
}

export class Hero3DBlock extends BaseBlock<Hero3DContent> {
  private viewerComp?: ThreeDViewerComponent;

  constructor(schema: PopupBlockSchema<Hero3DContent>, emitter: EventEmitter) {
    super(schema, emitter);
  }

  public render(): HTMLElement {
    const container = DomUtils.createElement('div', 'block-hero-3d');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';

    setTimeout(() => {
      const preset = { ...MY_HOUSING_COMPOSITE_PRESET };
      if (this.schema.content?.modelUrl) {
        preset.modelUrl = this.schema.content.modelUrl;
      }

      this.viewerComp = new ThreeDViewerComponent(this.emitter, {
        housePreset: preset,
        pathPreset: MY_HOUSING_WALKTHROUGH_PATH,
        hotspots: SAMPLE_PROPERTY.hotspots,
        className: 'hero-3d-canvas-wrap'
      });
      container.appendChild(this.viewerComp.element);
    }, 50);

    return container;
  }

  public dispose(): void {
    this.viewerComp?.dispose();
    super.dispose();
  }
}

