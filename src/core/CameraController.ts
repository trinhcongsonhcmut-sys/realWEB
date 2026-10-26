import * as THREE from 'three';
import { CameraState, CameraWaypoint, ViewMode } from '../types';
import { EventEmitter } from './EventEmitter';

export interface CameraTransitionOptions {
  duration?: number;
  onComplete?: () => void;
  easing?: (t: number) => number;
}

export const Easings = {
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  linear: (t: number) => t
};

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public emitter: EventEmitter;

  public state: CameraState = 'EXTERIOR_ORBIT';
  public viewMode: ViewMode = 'exterior';

  // Smooth cinematic curve path through the front door into the living room
  public cameraPath: THREE.CatmullRomCurve3;
  public targetPath: THREE.CatmullRomCurve3;

  // Walkthrough progress: 0.0 = Outside Overview -> 1.0 = Inside Living Room
  public walkProgress: number = 0.0;
  public targetWalkProgress: number = 0.0;

  // Orbit state when in Exterior mode (at walkProgress = 0)
  private spherical: THREE.Spherical = new THREE.Spherical();
  private targetSpherical: THREE.Spherical = new THREE.Spherical();
  public orbitTarget: THREE.Vector3 = new THREE.Vector3(0, 3.2, 0);

  // Interior 360 look state
  private currentYaw: number = 0;
  private targetYaw: number = 0;
  private currentPitch: number = 0;
  private targetPitch: number = 0;
  private interiorLookTarget: THREE.Vector3 = new THREE.Vector3();

  // Current active targets
  private currentCamPos: THREE.Vector3 = new THREE.Vector3();
  private currentLookTarget: THREE.Vector3 = new THREE.Vector3();

  // Pointer & Drag tracking
  private isPointerDown: boolean = false;
  private pointerStartX: number = 0;
  private pointerStartY: number = 0;
  private prevPointerX: number = 0;
  private prevPointerY: number = 0;

  // Active smooth transitions
  private isTransitioning: boolean = false;
  private transitionStartPos: THREE.Vector3 = new THREE.Vector3();
  private transitionEndPos: THREE.Vector3 = new THREE.Vector3();
  private transitionStartTarget: THREE.Vector3 = new THREE.Vector3();
  private transitionEndTarget: THREE.Vector3 = new THREE.Vector3();
  private transitionStartTime: number = 0;
  private transitionDuration: number = 1000;
  private transitionEasing: (t: number) => number = Easings.easeInOutCubic;
  private transitionCallback?: () => void;

  // Door opening progress callback
  public onDoorProgress?: (progress: number) => void;

  // Safe navigation bounds inside living room
  private readonly INTERIOR_BOUNDS = {
    minX: -2.7, maxX: 2.7,
    minY: 1.2,  maxY: 2.2,
    minZ: -8.0, maxZ: 0.5
  };

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement, emitter: EventEmitter) {
    this.camera = camera;
    this.domElement = domElement;
    this.emitter = emitter;

    // Define cinematic curve path:
    // Pt 0: Exterior Orbit origin
    // Pt 1: Approaching front garden walkway
    // Pt 2: Approaching front porch
    // Pt 3: Directly before main door
    // Pt 4: Passing through doorway threshold
    // Pt 5: Inside living room
    this.cameraPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(13.0, 7.5, 17.0),
      new THREE.Vector3(3.5, 3.8, 10.5),
      new THREE.Vector3(0.2, 2.0, 5.5),
      new THREE.Vector3(0.2, 1.65, 2.4),
      new THREE.Vector3(0.2, 1.65, 0.6),
      new THREE.Vector3(0.0, 1.65, -2.4)
    ]);

    this.targetPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 3.2, 0.0),
      new THREE.Vector3(0.1, 2.2, 2.0),
      new THREE.Vector3(0.2, 1.65, 1.4),
      new THREE.Vector3(0.2, 1.65, -0.5),
      new THREE.Vector3(0.0, 1.65, -3.5),
      new THREE.Vector3(0.0, 1.65, -5.5)
    ]);

    // Initialize spherical coordinates
    this.currentCamPos.copy(camera.position);
    this.currentLookTarget.copy(this.orbitTarget);
    this.spherical.setFromVector3(this.currentCamPos.clone().sub(this.orbitTarget));
    this.targetSpherical.copy(this.spherical);

    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerup', this.onPointerUp, { passive: true });
    window.addEventListener('pointercancel', this.onPointerUp, { passive: true });

    // Wheel event with passive: false so we can preventDefault page scroll
    window.addEventListener('wheel', this.onWheel, { passive: false });

    // Touch events for mobile
    window.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onPointerUp, { passive: true });

    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private isInteractiveUI(el: HTMLElement | null): boolean {
    if (!el) return false;
    return !!el.closest('button, input, a, select, textarea, .auth-modal, .scrollable-ui');
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.isInteractiveUI(e.target as HTMLElement)) return;

    this.isPointerDown = true;
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;

    const deltaX = e.clientX - this.prevPointerX;
    const deltaY = e.clientY - this.prevPointerY;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;

    if (this.viewMode === 'exterior') {
      if (this.walkProgress <= 0.08) {
        // At start of path: drag rotates orbit around the house
        const rotateSpeed = 0.005;
        this.targetSpherical.theta -= deltaX * rotateSpeed;
        this.targetSpherical.phi -= deltaY * rotateSpeed;
        this.targetSpherical.phi = Math.max(Math.PI / 8, Math.min(Math.PI / 2.05, this.targetSpherical.phi));
      } else {
        // When advancing along path, vertical dragging also advances/reverses walk
        this.addWalkDelta(-deltaY * 0.003);
      }
    } else if (this.viewMode === 'interior') {
      // 360 Panorama look inside the house
      const lookSpeed = 0.0035;
      this.targetYaw += deltaX * lookSpeed;
      this.targetPitch += deltaY * lookSpeed;

      const maxPitch = Math.PI * 0.44;
      this.targetPitch = Math.max(-maxPitch, Math.min(maxPitch, this.targetPitch));
    } else if (this.viewMode === 'dollhouse') {
      this.targetSpherical.theta -= deltaX * 0.005;
      this.targetSpherical.phi -= deltaY * 0.005;
      this.targetSpherical.phi = Math.max(Math.PI / 8, Math.min(Math.PI / 2.1, this.targetSpherical.phi));
    }
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private touchStartY: number = 0;
  private onTouchStart = (e: TouchEvent) => {
    if (this.isInteractiveUI(e.target as HTMLElement)) return;
    if (e.touches.length === 1) {
      this.isPointerDown = true;
      this.prevPointerX = e.touches[0].clientX;
      this.prevPointerY = e.touches[0].clientY;
      this.touchStartY = e.touches[0].clientY;
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

      if (this.viewMode === 'exterior') {
        // Swiping up/down on mobile advances or steps back
        if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
          this.addWalkDelta(-deltaY * 0.006);
        } else {
          // Horizontal swipe rotates orbit
          this.targetSpherical.theta -= deltaX * 0.007;
        }
      } else if (this.viewMode === 'interior') {
        this.targetYaw += deltaX * 0.005;
        this.targetPitch += deltaY * 0.005;
        this.targetPitch = Math.max(-Math.PI * 0.44, Math.min(Math.PI * 0.44, this.targetPitch));
      }
    }
  };

  private onWheel = (e: WheelEvent) => {
    // If inside a scrollable card/modal, let normal scroll happen
    const target = e.target as HTMLElement;
    if (target && target.closest('.auth-modal, .scrollable-ui, input, textarea')) {
      return;
    }

    e.preventDefault();

    // Wheel Up (deltaY < 0): Move forward / advance into house
    // Wheel Down (deltaY > 0): Step backward / zoom out
    const delta = -Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100) * 0.0015;
    this.addWalkDelta(delta);
  };

  public addWalkDelta(delta: number): void {
    if (this.viewMode === 'exterior') {
      // Step forward or backward along cinematic curve
      this.targetWalkProgress = Math.max(0.0, Math.min(1.0, this.targetWalkProgress + delta * 1.5));
      this.emitter.emit('camera:scroll-progress', this.targetWalkProgress);
    } else if (this.viewMode === 'interior') {
      // Step forward or backward in 360 room
      if (delta < -0.005) {
        // User is scrolling backward inside the room: if near entrance, transition back outside!
        if (this.camera.position.z >= -1.0) {
          this.setViewMode('exterior');
          this.targetWalkProgress = 0.7;
          return;
        }
      }

      // Move forward/backward along current view vector
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const moveStep = delta * 2.5;
      const nextPos = this.camera.position.clone().addScaledVector(forward, moveStep);

      // Clamp within safe bounds to prevent wall penetration
      nextPos.x = Math.max(this.INTERIOR_BOUNDS.minX, Math.min(this.INTERIOR_BOUNDS.maxX, nextPos.x));
      nextPos.y = Math.max(this.INTERIOR_BOUNDS.minY, Math.min(this.INTERIOR_BOUNDS.maxY, nextPos.y));
      nextPos.z = Math.max(this.INTERIOR_BOUNDS.minZ, Math.min(this.INTERIOR_BOUNDS.maxZ, nextPos.z));

      this.camera.position.copy(nextPos);
      this.syncInteriorLook();
    } else if (this.viewMode === 'dollhouse') {
      this.targetSpherical.radius = Math.max(8.0, Math.min(30.0, this.targetSpherical.radius - delta * 20.0));
    }
  }

  public setWalkProgress(progress: number): void {
    this.targetWalkProgress = Math.max(0.0, Math.min(1.0, progress));
    this.emitter.emit('camera:scroll-progress', this.targetWalkProgress);
  }

  public stepForward(): void {
    this.addWalkDelta(0.15);
  }

  public stepBackward(): void {
    this.addWalkDelta(-0.15);
  }

  public syncInteriorLook(): void {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    this.currentYaw = Math.atan2(dir.x, dir.z);
    this.targetYaw = this.currentYaw;

    this.currentPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
    this.targetPitch = this.currentPitch;
  }

  public moveTo(waypoint: CameraWaypoint, options: CameraTransitionOptions = {}): void {
    this.isTransitioning = true;
    this.transitionStartTime = performance.now();
    this.transitionDuration = options.duration ?? 1000;
    this.transitionEasing = options.easing ?? Easings.easeInOutCubic;
    this.transitionCallback = options.onComplete;

    this.transitionStartPos.copy(this.camera.position);
    this.transitionEndPos.set(waypoint.position[0], waypoint.position[1], waypoint.position[2]);

    this.transitionStartTarget.copy(this.currentLookTarget);
    this.transitionEndTarget.set(waypoint.target[0], waypoint.target[1], waypoint.target[2]);
  }

  public setViewMode(mode: ViewMode, waypoint?: CameraWaypoint): void {
    this.viewMode = mode;
    this.emitter.emit('view:mode-changed', mode);

    if (mode === 'exterior') {
      this.state = 'EXTERIOR_ORBIT';
      this.emitter.emit('camera:state-changed', this.state);
      this.targetWalkProgress = 0.0;
      this.walkProgress = 0.0;

      const wp = {
        position: [13.0, 7.5, 17.0] as [number, number, number],
        target: [0, 3.2, 0] as [number, number, number]
      };

      this.moveTo(wp, {
        duration: 1100,
        onComplete: () => {
          this.orbitTarget.set(0, 3.2, 0);
          this.spherical.setFromVector3(this.camera.position.clone().sub(this.orbitTarget));
          this.targetSpherical.copy(this.spherical);
        }
      });

      if (this.onDoorProgress) this.onDoorProgress(0);
    } else if (mode === 'interior') {
      this.state = 'INTERIOR_EXPLORATION';
      this.emitter.emit('camera:state-changed', this.state);
      this.targetWalkProgress = 1.0;
      this.walkProgress = 1.0;

      const wp = waypoint || {
        position: [0.0, 1.65, -2.4] as [number, number, number],
        target: [0.0, 1.65, -5.5] as [number, number, number]
      };

      this.moveTo(wp, {
        duration: 900,
        onComplete: () => {
          this.currentLookTarget.set(wp.target[0], wp.target[1], wp.target[2]);
          this.syncInteriorLook();
        }
      });

      if (this.onDoorProgress) this.onDoorProgress(1.0);
    } else if (mode === 'dollhouse') {
      this.state = 'DOLLHOUSE_VIEW';
      this.emitter.emit('camera:state-changed', this.state);
      this.orbitTarget.set(0, 2.8, 0);

      this.moveTo({
        position: [0.0, 16.0, 15.0],
        target: [0, 2.8, 0]
      }, {
        duration: 1100,
        onComplete: () => {
          this.spherical.setFromVector3(this.camera.position.clone().sub(this.orbitTarget));
          this.targetSpherical.copy(this.spherical);
        }
      });
    } else if (mode === 'floorplan') {
      this.state = 'FLOORPLAN_VIEW';
      this.emitter.emit('camera:state-changed', this.state);

      this.moveTo({
        position: [0.0, 21.0, 0.001],
        target: [0, 0, 0]
      }, {
        duration: 1100,
        onComplete: () => {
          this.currentLookTarget.set(0, 0, 0);
        }
      });
    }
  }

  public update(now: number, delta: number): void {
    // 1. Programmatic tween transitions (between modes or room hotspots)
    if (this.isTransitioning) {
      const elapsed = now - this.transitionStartTime;
      const progress = Math.min(1.0, elapsed / this.transitionDuration);
      const eased = this.transitionEasing(progress);

      this.camera.position.lerpVectors(this.transitionStartPos, this.transitionEndPos, eased);
      this.currentLookTarget.lerpVectors(this.transitionStartTarget, this.transitionEndTarget, eased);
      this.camera.lookAt(this.currentLookTarget);

      if (progress >= 1.0) {
        this.isTransitioning = false;
        if (this.transitionCallback) {
          const cb = this.transitionCallback;
          this.transitionCallback = undefined;
          cb();
        }
      }
      return;
    }

    // 2. Exterior Mode: Cinematic Curve Walkthrough + Orbit
    if (this.viewMode === 'exterior') {
      // Damped lerp on walk progress
      const progressDiff = this.targetWalkProgress - this.walkProgress;
      if (Math.abs(progressDiff) > 0.0001) {
        this.walkProgress += progressDiff * Math.min(1.0, delta * 6.0);

        // Synchronize door hinge opening (starts opening at 0.45, fully open at 0.8)
        if (this.onDoorProgress) {
          const doorFactor = Math.max(0, Math.min(1.0, (this.walkProgress - 0.45) / 0.35));
          this.onDoorProgress(doorFactor);
        }

        // Determine FSM State
        if (this.walkProgress < 0.25) {
          if (this.state !== 'EXTERIOR_ORBIT') {
            this.state = 'EXTERIOR_ORBIT';
            this.emitter.emit('camera:state-changed', this.state);
          }
        } else if (this.walkProgress < 0.65) {
          if (this.state !== 'APPROACH_FACADE') {
            this.state = 'APPROACH_FACADE';
            this.emitter.emit('camera:state-changed', this.state);
          }
        } else if (this.walkProgress < 0.92) {
          if (this.state !== 'FRONT_DOOR_FOCUS') {
            this.state = 'FRONT_DOOR_FOCUS';
            this.emitter.emit('camera:state-changed', this.state);
          }
        } else {
          // Reached interior: automatically switch to interior exploration!
          if (this.state !== 'PORTAL_TRANSITION' && this.state !== 'INTERIOR_EXPLORATION') {
            this.state = 'PORTAL_TRANSITION';
            this.emitter.emit('camera:state-changed', this.state);
            this.setViewMode('interior');
            return;
          }
        }

        // Interpolate camera along curve
        const curvePoint = this.cameraPath.getPoint(Math.min(0.999, Math.max(0.001, this.walkProgress)));
        const targetPoint = this.targetPath.getPoint(Math.min(0.999, Math.max(0.001, this.walkProgress)));

        // If at the very start (progress < 0.1), blend with Orbit position
        if (this.walkProgress < 0.1) {
          const orbitPos = new THREE.Vector3().setFromSpherical(this.spherical).add(this.orbitTarget);
          const blend = this.walkProgress / 0.1;
          this.camera.position.lerpVectors(orbitPos, curvePoint, blend);
          this.currentLookTarget.lerpVectors(this.orbitTarget, targetPoint, blend);
        } else {
          this.camera.position.copy(curvePoint);
          this.currentLookTarget.copy(targetPoint);
        }

        this.camera.lookAt(this.currentLookTarget);
        return;
      }

      // If at start (walkProgress < 0.05) and not advancing, allow continuous smooth orbit
      if (this.walkProgress <= 0.05) {
        const dampFactor = Math.min(1.0, delta * 10.0);
        this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * dampFactor;
        this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * dampFactor;
        this.spherical.makeSafe();

        const orbitPos = new THREE.Vector3().setFromSpherical(this.spherical).add(this.orbitTarget);
        this.camera.position.copy(orbitPos);
        this.camera.lookAt(this.orbitTarget);
        this.currentLookTarget.copy(this.orbitTarget);
      }
      return;
    }

    // 3. Interior Mode: 360 Panorama Look
    if (this.viewMode === 'interior') {
      const lookDamp = Math.min(1.0, delta * 12.0);
      this.currentYaw += (this.targetYaw - this.currentYaw) * lookDamp;
      this.currentPitch += (this.targetPitch - this.currentPitch) * lookDamp;

      const lookDistance = 6.0;
      const cosPitch = Math.cos(this.currentPitch);
      const dirX = Math.sin(this.currentYaw) * cosPitch;
      const dirY = Math.sin(this.currentPitch);
      const dirZ = Math.cos(this.currentYaw) * cosPitch;

      this.currentLookTarget.set(
        this.camera.position.x + dirX * lookDistance,
        this.camera.position.y + dirY * lookDistance,
        this.camera.position.z + dirZ * lookDistance
      );

      this.camera.lookAt(this.currentLookTarget);
      return;
    }

    // 4. Dollhouse Mode: Orbit view
    if (this.viewMode === 'dollhouse') {
      const dampFactor = Math.min(1.0, delta * 10.0);
      this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * dampFactor;
      this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * dampFactor;
      this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * dampFactor;
      this.spherical.makeSafe();

      const newPos = new THREE.Vector3().setFromSpherical(this.spherical).add(this.orbitTarget);
      this.camera.position.copy(newPos);
      this.camera.lookAt(this.orbitTarget);
    }
  }

  public dispose(): void {
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onPointerUp);
  }
}
