import * as THREE from 'three';
import { EventEmitter } from '../core/EventEmitter';
import { HouseNavigationConfig, DEFAULT_TOWNHOUSE_NAV_CONFIG } from '../config/houseNavigationConfig';
import { CameraPathController } from './CameraPathController';
import { ScrollProgressController } from './ScrollProgressController';
import { InteriorLookController } from './InteriorLookController';
import { ViewMode, CameraWalkState } from '../types';

export type CameraFSMState =
  | 'EXTERIOR'
  | 'APPROACHING_DOOR'
  | 'ENTERING_HOUSE'
  | 'INTERIOR_ARRIVAL'
  | 'INTERIOR_LOOK_AROUND'
  | 'RETURNING_OUTSIDE'
  | 'EXTERIOR_SCROLL_PATH'
  | 'RETURNING_TO_EXTERIOR'
  | 'DOLLHOUSE_VIEW'
  | 'FLOORPLAN_VIEW';

export class CameraStateMachine {
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public emitter: EventEmitter;
  public config: HouseNavigationConfig;

  public state: CameraFSMState = 'EXTERIOR';
  public viewMode: ViewMode = 'exterior';

  // Sub-controllers
  public pathController: CameraPathController;
  public scrollController: ScrollProgressController;
  public interiorController: InteriorLookController;

  // Door opening progress callback
  public onDoorProgress?: (doorFactor: number) => void;

  // Returning animation state to exterior overview
  private isReturning: boolean = false;
  private returnStartTime: number = 0;
  private returnDuration: number = 1200;
  private returnStartProgress: number = 0;

  // Smooth re-alignment when exiting 360 interior mode back to path
  private isRealigningToPath: boolean = false;
  private realignStartTime: number = 0;
  private realignDuration: number = 450;
  private realignStartQuat: THREE.Quaternion = new THREE.Quaternion();
  private realignTargetQuat: THREE.Quaternion = new THREE.Quaternion();
  private realignTargetProgress: number = 0.95;

  // Overview Orbit state for dollhouse
  private dollhouseSpherical: THREE.Spherical = new THREE.Spherical(22, Math.PI / 3, 0);
  private dollhouseTarget: THREE.Vector3 = new THREE.Vector3(0, 2.8, 0);
  private isPointerDown: boolean = false;
  private prevPointerX: number = 0;
  private prevPointerY: number = 0;

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    emitter: EventEmitter,
    config: HouseNavigationConfig = DEFAULT_TOWNHOUSE_NAV_CONFIG
  ) {
    this.camera = camera;
    this.domElement = domElement;
    this.emitter = emitter;
    this.config = config;

    this.pathController = new CameraPathController(config);
    this.scrollController = new ScrollProgressController(
      config.scrollSensitivity,
      config.progressDamping
    );
    this.interiorController = new InteriorLookController(camera, config);

    // Initial camera position at Waypoint 1 (progress = 0)
    const initialSample = this.pathController.getSample(0.0);
    this.camera.position.copy(initialSample.position);
    this.camera.lookAt(initialSample.target);

    this.setupProgressCallback();
    this.bindEvents();

    // Listen for direct focus on 3D object (e.g. Chibi figure)
    this.emitter.on('camera:focus-object', (data: any) => {
      this.scrollController.setProgress(0.60, true);
      this.state = 'INTERIOR_LOOK_AROUND';
      this.viewMode = 'interior';
      this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
      this.emitter.emit('camera:state-changed', 'INTERIOR_EXPLORATION');
      this.emitter.emit('view:mode-changed', this.viewMode);

      const station = new THREE.Vector3(data.position[0], data.position[1], data.position[2]);
      const target = new THREE.Vector3(data.target[0], data.target[1], data.target[2]);
      const dir = target.clone().sub(station).normalize();
      this.interiorController.activate(dir, station);
    });
  }

  public isScrollPathMode(state: CameraFSMState = this.state): boolean {
    return (
      state === 'EXTERIOR' ||
      state === 'APPROACHING_DOOR' ||
      state === 'ENTERING_HOUSE' ||
      state === 'EXTERIOR_SCROLL_PATH'
    );
  }

  public getStateForProgress(p: number): CameraFSMState {
    if (p < 0.25) return 'EXTERIOR';
    if (p < 0.52) return 'APPROACHING_DOOR';
    if (p < 0.92) return 'ENTERING_HOUSE';
    return 'INTERIOR_LOOK_AROUND';
  }

  private setupProgressCallback(): void {
    this.scrollController.setCallback((progress: number) => {
      this.emitter.emit('camera:scroll-progress', progress);

      const sample = this.pathController.getSample(progress);

      // Update front door opening animation
      const doorFactor = this.pathController.getDoorFactor(progress);
      if (this.onDoorProgress) {
        this.onDoorProgress(doorFactor);
      }

      // Check if camera is inside the living room (threshold >= 0.92)
      // Spline smoothly glides camera through the open door to living room center [0, 1.50, -0.6]
      const interiorThreshold = 0.92;
      if (progress >= interiorThreshold) {
        if (this.state !== 'INTERIOR_LOOK_AROUND') {
          // Entering interior 360 mode from outside
          this.state = 'INTERIOR_LOOK_AROUND';
          this.viewMode = 'interior';
          this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
          this.emitter.emit('camera:state-changed', 'INTERIOR_EXPLORATION');
          this.emitter.emit('view:mode-changed', this.viewMode);

          // Initial view direction facing into room
          const enterDir = sample.target.clone().sub(sample.position).normalize();
          this.interiorController.activate(enterDir, sample.position);
          this.emitter.emit('camera:enter-free-glb');
        }
      } else {
        // Outside (progress < interiorThreshold)
        if (this.state === 'INTERIOR_LOOK_AROUND' || this.viewMode === 'interior') {
          // Returning outside from inside
          this.interiorController.deactivate();
          this.viewMode = 'exterior';
          this.emitter.emit('view:mode-changed', this.viewMode);
        }

        const nextState = this.getStateForProgress(progress);
        if (this.state !== nextState) {
          this.state = nextState;
          this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
        }

        this.camera.position.copy(sample.position);
        this.camera.lookAt(sample.target);
      }
    });
  }

  private bindEvents(): void {
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerup', this.onPointerUp, { passive: true });
    window.addEventListener('pointercancel', this.onPointerUp, { passive: true });

    // Touch events for mobile
    window.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onPointerUp, { passive: true });

    // Keyboard navigation (WASD / Arrows) and context menu handling
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('contextmenu', this.onContextMenu);
  }

  private isScrollableContent(el: any): boolean {
    if (!el || typeof el.closest !== 'function') return false;
    return !!el.closest('.auth-modal, .scrollable-ui, textarea, select');
  }

  private isInteractiveUI(el: any): boolean {
    if (!el || typeof el.closest !== 'function') return false;
    return !!el.closest('button, input, a, select, textarea, .auth-modal, .scrollable-ui, .hud-interactive');
  }

  private onWheel = (e: WheelEvent) => {
    // Only prevent wheel camera scrolling if user is actively scrolling inside a scrollable modal/list
    if (this.isScrollableContent(e.target as HTMLElement)) return;

    e.preventDefault();

    if (this.state === 'INTERIOR_LOOK_AROUND') {
      // If user rolls backward when standing near the doorway threshold, step back outside smoothly
      if (e.deltaY < 0 && this.interiorController.stationPosition.z >= 0.70) {
        this.interiorController.deactivate();
        this.state = 'ENTERING_HOUSE';
        this.viewMode = 'exterior';
        this.emitter.emit('view:mode-changed', this.viewMode);
        this.scrollController.setProgress(0.72, true);
        return;
      }
      this.interiorController.onWheel(e.deltaY);
    } else {
      // Wheel reliably drives progress through all stages anywhere on screen
      this.scrollController.handleWheel(e);
    }
  };

  // Interaction blocking hook (e.g. while dragging furniture)
  public isInteractionBlocked?: () => boolean;

  private onPointerDown = (e: PointerEvent) => {
    if (this.isInteractiveUI(e.target as HTMLElement)) return;
    if (this.isInteractionBlocked && this.isInteractionBlocked()) return;

    this.isPointerDown = true;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;

    if (this.state === 'INTERIOR_LOOK_AROUND' || this.scrollController.currentProgress >= 0.65) {
      if (this.state !== 'INTERIOR_LOOK_AROUND') {
        const sample = this.pathController.getSample(this.scrollController.currentProgress);
        this.state = 'INTERIOR_LOOK_AROUND';
        this.viewMode = 'interior';
        this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
        this.emitter.emit('camera:state-changed', 'INTERIOR_EXPLORATION');
        this.emitter.emit('view:mode-changed', this.viewMode);
        const enterDir = sample.target.clone().sub(sample.position).normalize();
        this.interiorController.activate(enterDir, sample.position);
      }
      this.interiorController.onPointerDown(e.clientX, e.clientY, e.button);
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    const active = document.activeElement as HTMLElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    if (this.state === 'INTERIOR_LOOK_AROUND' || this.scrollController.currentProgress >= 0.65) {
      if (this.state !== 'INTERIOR_LOOK_AROUND') {
        const sample = this.pathController.getSample(this.scrollController.currentProgress);
        this.state = 'INTERIOR_LOOK_AROUND';
        this.viewMode = 'interior';
        this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
        this.emitter.emit('camera:state-changed', 'INTERIOR_EXPLORATION');
        this.emitter.emit('view:mode-changed', this.viewMode);
        const enterDir = sample.target.clone().sub(sample.position).normalize();
        this.interiorController.activate(enterDir, sample.position);
      }
      this.interiorController.onKeyDown(e.code);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (this.state === 'INTERIOR_LOOK_AROUND') {
      this.interiorController.onKeyUp(e.code);
    }
  };

  private onContextMenu = (e: MouseEvent) => {
    if (this.state === 'INTERIOR_LOOK_AROUND') {
      e.preventDefault();
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    if (this.isInteractionBlocked && this.isInteractionBlocked()) return;

    const deltaX = e.clientX - this.prevPointerX;
    const deltaY = e.clientY - this.prevPointerY;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;

    if (this.state === 'INTERIOR_LOOK_AROUND') {
      this.interiorController.onPointerMove(e.clientX, e.clientY);
    } else if (this.state === 'DOLLHOUSE_VIEW') {
      this.dollhouseSpherical.theta -= deltaX * 0.005;
      this.dollhouseSpherical.phi -= deltaY * 0.005;
      this.dollhouseSpherical.phi = Math.max(Math.PI / 8, Math.min(Math.PI / 2.1, this.dollhouseSpherical.phi));
      this.dollhouseSpherical.makeSafe();

      this.camera.position.setFromSpherical(this.dollhouseSpherical).add(this.dollhouseTarget);
      this.camera.lookAt(this.dollhouseTarget);
    }
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
    if (this.state === 'INTERIOR_LOOK_AROUND') {
      this.interiorController.onPointerUp();
    }
  };

  private onTouchStart = (e: TouchEvent) => {
    if (this.isInteractiveUI(e.target as HTMLElement)) return;
    if (e.touches.length === 1) {
      this.isPointerDown = true;
      this.prevPointerX = e.touches[0].clientX;
      this.prevPointerY = e.touches[0].clientY;

      if (this.state === 'INTERIOR_LOOK_AROUND' || this.scrollController.currentProgress >= 0.65) {
        if (this.state !== 'INTERIOR_LOOK_AROUND') {
          const sample = this.pathController.getSample(this.scrollController.currentProgress);
          this.state = 'INTERIOR_LOOK_AROUND';
          this.viewMode = 'interior';
          this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
          this.emitter.emit('camera:state-changed', 'INTERIOR_EXPLORATION');
          this.emitter.emit('view:mode-changed', this.viewMode);
          const enterDir = sample.target.clone().sub(sample.position).normalize();
          this.interiorController.activate(enterDir, sample.position);
        }
        this.interiorController.onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (this.isInteractiveUI(e.target as HTMLElement)) return;
    if (e.touches.length === 1 && this.isPointerDown) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - this.prevPointerX;
      const deltaY = e.touches[0].clientY - this.prevPointerY;
      this.prevPointerX = e.touches[0].clientX;
      this.prevPointerY = e.touches[0].clientY;

      if (this.isScrollPathMode()) {
        // Vertical swipe drives progress along the fixed path
        this.scrollController.handleTouchSwipe(deltaY);
      } else if (this.state === 'INTERIOR_LOOK_AROUND') {
        this.interiorController.onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }
  };

  /**
   * Activates INTERIOR_LOOK_AROUND seamlessly at specified progress (default 0.50: Vào phòng).
   */
  public transitionToInteriorLook(targetProgress: number = 0.65): void {
    this.scrollController.setProgress(targetProgress, true);
    const sample = this.pathController.getSample(targetProgress);

    this.state = 'INTERIOR_LOOK_AROUND';
    this.viewMode = 'interior';
    this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
    this.emitter.emit('camera:state-changed', 'INTERIOR_EXPLORATION');
    this.emitter.emit('view:mode-changed', this.viewMode);

    const enterDir = sample.target.clone().sub(sample.position).normalize();
    this.interiorController.activate(enterDir, sample.position);
  }

  /**
   * Smooth transition when clicking "Trở ra" (Exit 360 mode).
   * Slerps camera rotation back to the exit doorway, then hands control to CameraPathController.
   */
  public returnToPathAndScrollBack(): void {
    if (this.state !== 'INTERIOR_LOOK_AROUND' && !this.isRealigningToPath) return;

    this.interiorController.deactivate();
    this.state = 'RETURNING_OUTSIDE';
    this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);

    const exitSample = this.pathController.getSample(0.50);

    // Compute target quaternion facing out through the doorway
    const tempCam = this.camera.clone();
    tempCam.position.copy(exitSample.position);
    tempCam.lookAt(exitSample.target);

    this.realignStartQuat.copy(this.camera.quaternion);
    this.realignTargetQuat.copy(tempCam.quaternion);
    this.realignStartTime = performance.now();
    this.realignDuration = 450;
    this.isRealigningToPath = true;
    this.realignTargetProgress = 0.50;
  }

  public transitionToExteriorPath(startProgress: number = 0.0): void {
    this.interiorController.deactivate();
    this.state = this.getStateForProgress(startProgress);
    this.viewMode = 'exterior';
    this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
    this.emitter.emit('camera:state-changed', 'EXTERIOR_ORBIT');
    this.emitter.emit('view:mode-changed', this.viewMode);

    this.scrollController.setProgress(startProgress, true);

    const sample = this.pathController.getSample(startProgress);
    this.camera.position.copy(sample.position);
    this.camera.lookAt(sample.target);

    if (this.onDoorProgress) {
      this.onDoorProgress(this.pathController.getDoorFactor(startProgress));
    }
  }

  /**
   * Smoothly returns to the exterior overview (Waypoint 1).
   */
  public returnToExteriorOverview(): void {
    this.interiorController.deactivate();
    this.state = 'RETURNING_TO_EXTERIOR';
    this.viewMode = 'exterior';
    this.emitter.emit('camera:walk-state-changed', 'EXTERIOR');
    this.emitter.emit('camera:state-changed', 'EXTERIOR_ORBIT');
    this.emitter.emit('view:mode-changed', this.viewMode);

    this.isReturning = true;
    this.returnStartTime = performance.now();
    this.returnDuration = 1200;
    this.returnStartProgress = this.scrollController.currentProgress;
  }

  public setViewMode(mode: ViewMode, waypoint?: import('../types').CameraWaypoint): void {
    if (mode === 'exterior') {
      this.returnToExteriorOverview();
    } else if (mode === 'interior') {
      this.viewMode = 'interior';
      if (waypoint) {
        this.scrollController.setProgress(1.0, true);
        this.state = 'INTERIOR_LOOK_AROUND';
        this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
        this.emitter.emit('camera:state-changed', 'INTERIOR_EXPLORATION');
        this.emitter.emit('view:mode-changed', this.viewMode);

        const station = new THREE.Vector3(waypoint.position[0], waypoint.position[1], waypoint.position[2]);
        const target = new THREE.Vector3(waypoint.target[0], waypoint.target[1], waypoint.target[2]);
        const dir = target.clone().sub(station).normalize();
        this.interiorController.activate(dir, station);
      } else {
        this.transitionToInteriorLook(1.0);
      }
    } else if (mode === 'dollhouse') {
      this.interiorController.deactivate();
      this.state = 'DOLLHOUSE_VIEW';
      this.viewMode = 'dollhouse';
      this.emitter.emit('camera:state-changed', 'DOLLHOUSE_VIEW');
      this.emitter.emit('view:mode-changed', this.viewMode);

      this.dollhouseSpherical.set(22, Math.PI / 3, 0);
      this.camera.position.setFromSpherical(this.dollhouseSpherical).add(this.dollhouseTarget);
      this.camera.lookAt(this.dollhouseTarget);
    } else if (mode === 'floorplan') {
      this.interiorController.deactivate();
      this.state = 'FLOORPLAN_VIEW';
      this.viewMode = 'floorplan';
      this.emitter.emit('camera:state-changed', 'FLOORPLAN_VIEW');
      this.emitter.emit('view:mode-changed', this.viewMode);

      this.camera.position.set(0.0, 21.0, 0.001);
      this.camera.lookAt(0, 0, 0);
    }
  }

  public setWalkProgress(progress: number): void {
    if (progress < 0.48 && this.state === 'INTERIOR_LOOK_AROUND') {
      this.transitionToExteriorPath(progress);
    } else {
      this.scrollController.setProgress(progress);
    }
  }

  public stepForward(): void {
    this.scrollController.addDelta(0.25);
  }

  public stepBackward(): void {
    if (this.scrollController.currentProgress <= 0.50 && this.state === 'INTERIOR_LOOK_AROUND') {
      this.returnToPathAndScrollBack();
    } else {
      this.scrollController.addDelta(-0.25);
    }
  }

  public update(now: number, delta: number): void {
    // 1. Smooth re-alignment from interior 360 back to path doorway
    if (this.isRealigningToPath) {
      const elapsed = now - this.realignStartTime;
      const t = Math.min(1.0, elapsed / this.realignDuration);
      const eased = 1 - Math.pow(1 - t, 3); // Ease out cubic

      this.camera.quaternion.slerpQuaternions(this.realignStartQuat, this.realignTargetQuat, eased);

      if (t >= 1.0) {
        this.isRealigningToPath = false;
        this.scrollController.setProgress(this.realignTargetProgress, true);
        this.state = 'APPROACHING_DOOR';
        this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
      }
      return;
    }

    // 2. Smooth return to exterior overview animation
    if (this.isReturning) {
      const elapsed = now - this.returnStartTime;
      const t = Math.min(1.0, elapsed / this.returnDuration);
      const easedT = 1 - Math.pow(1 - t, 3);
      const currentP = this.returnStartProgress * (1 - easedT);

      this.scrollController.setProgress(currentP, true);
      const sample = this.pathController.getSample(currentP);
      this.camera.position.copy(sample.position);
      this.camera.lookAt(sample.target);

      if (this.onDoorProgress) {
        this.onDoorProgress(this.pathController.getDoorFactor(currentP));
      }

      if (t >= 1.0) {
        this.isReturning = false;
        this.state = 'EXTERIOR';
        this.emitter.emit('camera:walk-state-changed', this.state as CameraWalkState);
      }
      return;
    }

    // 3. Always update scroll damping every frame
    this.scrollController.update(delta);

    // 4. Interior Look Around Mode (Cấp 3, Cấp 4, Cấp 5: 360° rotation)
    if (this.state === 'INTERIOR_LOOK_AROUND') {
      this.interiorController.update(delta);
      return;
    }
  }

  public dispose(): void {
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('contextmenu', this.onContextMenu);
  }
}
