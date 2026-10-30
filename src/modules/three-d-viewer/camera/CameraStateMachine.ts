import * as THREE from 'three';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { CameraPathPreset, CameraWalkState, ViewMode } from '../schemas/3d.types';
import { CameraPathController } from './CameraPathController';
import { ScrollProgressController } from './ScrollProgressController';
import { InteriorLookController } from './InteriorLookController';

export class CameraStateMachine {
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public emitter: EventEmitter;
  public preset: CameraPathPreset;

  public state: CameraWalkState = 'EXTERIOR';
  public viewMode: ViewMode = 'exterior';

  public pathController: CameraPathController;
  public scrollController: ScrollProgressController;
  public interiorController: InteriorLookController;

  public onDoorProgress?: (doorFactor: number) => void;

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    emitter: EventEmitter,
    preset: CameraPathPreset
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.emitter = emitter;
    this.preset = preset;

    this.pathController = new CameraPathController(preset);
    this.scrollController = new ScrollProgressController(
      preset.scrollSensitivity ?? 0.00025,
      preset.progressDamping ?? 5.2
    );
    this.interiorController = new InteriorLookController(camera, preset);

    const initialSample = this.pathController.getSample(0.0);
    this.camera.position.copy(initialSample.position);
    this.camera.lookAt(initialSample.target);

    this.setupProgressCallback();
    this.bindEvents();
  }

  private setupProgressCallback(): void {
    this.scrollController.setCallback((progress: number) => {
      this.emitter.emit('camera:scroll-progress', progress);

      const sample = this.pathController.getSample(progress);
      const doorFactor = this.pathController.getDoorFactor(progress);
      if (this.onDoorProgress) {
        this.onDoorProgress(doorFactor);
      }

      const interiorThreshold = 0.94;
      if (progress >= interiorThreshold) {
        if (this.state !== 'INTERIOR_LOOK_AROUND') {
          this.state = 'INTERIOR_LOOK_AROUND';
          this.viewMode = 'interior';
          this.emitter.emit('camera:walk-state-changed', this.state);

          const samplePrev = this.pathController.getSample(0.92);
          const fwd = sample.target.clone().sub(samplePrev.position).normalize();
          this.interiorController.activate(fwd);
        }
      } else {
        if (this.state === 'INTERIOR_LOOK_AROUND') {
          this.interiorController.deactivate();
        }
        if (progress < 0.40) this.state = 'EXTERIOR';
        else if (progress < 0.70) this.state = 'APPROACHING_DOOR';
        else this.state = 'ENTERING_HOUSE';

        this.viewMode = 'exterior';
        this.camera.position.copy(sample.position);
        this.camera.lookAt(sample.target);
        this.emitter.emit('camera:walk-state-changed', this.state);
      }
    });
  }

  private bindEvents(): void {
    this.domElement.addEventListener('pointerdown', (e) => {
      if (this.state === 'INTERIOR_LOOK_AROUND') {
        this.interiorController.onPointerDown(e.clientX, e.clientY);
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (this.state === 'INTERIOR_LOOK_AROUND') {
        this.interiorController.onPointerMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.state === 'INTERIOR_LOOK_AROUND') {
        this.interiorController.onPointerUp();
      }
    });
  }

  public update(delta: number): void {
    this.scrollController.update(delta);
    if (this.state === 'INTERIOR_LOOK_AROUND') {
      this.interiorController.update(delta);
    }
  }

  public dispose(): void {
    this.interiorController.deactivate();
  }
}

