import * as THREE from 'three';
import { EventEmitter } from '../core/EventEmitter';

export class GlbFreeExplorationController {
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public emitter: EventEmitter;

  public isActive: boolean = false;
  public isTransitioning: boolean = false;

  // Station / Camera eye position
  public position: THREE.Vector3 = new THREE.Vector3(0.0, 1.65, 0.5);

  // Euler angles with 'YXZ' order for gimbal-lock-free 360 in-place rotation
  public currentYaw: number = 0;
  public targetYaw: number = 0;
  public currentPitch: number = 0;
  public targetPitch: number = 0;

  // Sensitivity and responsiveness tuning
  public lookSensitivity: number = 0.0032;
  public dampingFactor: number = 22.0; // Rapid, silky damping - stops in ~150ms with zero unwanted inertia drift
  public moveSpeed: number = 2.8; // Natural walking speed (m/s)
  public panSpeed: number = 0.004;

  // Pointer drag state
  private isPointerDown: boolean = false;
  private pointerButton: number = 0; // 0 = rotate 360, 2 = pan
  private prevPointerX: number = 0;
  private prevPointerY: number = 0;

  // Keyboard navigation
  private keysPressed: Set<string> = new Set();
  public isInteractionBlocked?: () => boolean;

  // Smooth transition tweening when entering
  private transitionStartPos: THREE.Vector3 = new THREE.Vector3();
  private transitionEndPos: THREE.Vector3 = new THREE.Vector3();
  private transitionStartYaw: number = 0;
  private transitionEndYaw: number = 0;
  private transitionStartPitch: number = 0;
  private transitionEndPitch: number = 0;
  private transitionStartTime: number = 0;
  private transitionDuration: number = 750; // ms

  // Reusable vectors for zero garbage-collection overhead
  private tempForward: THREE.Vector3 = new THREE.Vector3();
  private tempRight: THREE.Vector3 = new THREE.Vector3();
  private moveVec: THREE.Vector3 = new THREE.Vector3();

  // Living room safe bounds (4.8m wide x 10m deep) with 35cm wall safety margin
  public static readonly ROOM_BOUNDS = {
    minX: -2.0,
    maxX: 2.0,
    minY: 1.15,
    maxY: 2.1,
    minZ: -8.1,
    maxZ: 0.65
  };

  // Default living room vantage point & center look target
  public static readonly DEFAULT_ROOM_POSITION = new THREE.Vector3(0.0, 1.65, 0.5);
  public static readonly DEFAULT_ROOM_TARGET = new THREE.Vector3(0.0, 1.35, -2.5);

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement, emitter: EventEmitter) {
    this.camera = camera;
    this.domElement = domElement;
    this.emitter = emitter;

    this.position.copy(GlbFreeExplorationController.DEFAULT_ROOM_POSITION);

    this.bindEvents();
  }

  private bindEvents(): void {
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);

    this.domElement.addEventListener('wheel', this.onWheel, { passive: false });
    this.domElement.addEventListener('contextmenu', this.onContextMenu);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
  }

  private onContextMenu = (e: MouseEvent) => {
    if (this.isActive) {
      e.preventDefault(); // Enable right-click dragging for smooth panning
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    if (!this.isActive || this.isTransitioning) return;
    if (this.isInteractionBlocked && this.isInteractionBlocked()) return;

    this.isPointerDown = true;
    this.pointerButton = e.button;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isActive || !this.isPointerDown || this.isTransitioning) return;
    if (this.isInteractionBlocked && this.isInteractionBlocked()) return;

    const deltaX = e.clientX - this.prevPointerX;
    const deltaY = e.clientY - this.prevPointerY;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;

    if (this.pointerButton === 2) {
      // PAN (Right-click drag): Strafe camera laterally and vertically
      this.getHorizontalDirections(this.tempForward, this.tempRight);

      this.position.addScaledVector(this.tempRight, -deltaX * this.panSpeed);
      this.position.y += deltaY * this.panSpeed;
      this.clampRoomBounds();
    } else {
      // FIRST-PERSON 360 LOOK (Left-click drag):
      // Camera turns in-place around user's own viewpoint (Orbit radius R = 0).
      // Camera coordinates do not move, preventing clipping through any walls!
      this.targetYaw -= deltaX * this.lookSensitivity;
      this.targetPitch -= deltaY * this.lookSensitivity;

      // Clamp vertical pitch [-82°, +82°] so user can look straight up at ceiling lights and down at floor
      const maxPitch = Math.PI * 0.45;
      const minPitch = -Math.PI * 0.45;
      this.targetPitch = Math.max(minPitch, Math.min(maxPitch, this.targetPitch));
    }
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    if (!this.isActive || this.isTransitioning) return;
    if (this.isInteractionBlocked && this.isInteractionBlocked()) return;

    e.preventDefault();

    // Wheel up (deltaY < 0): walk forward into room
    // Wheel down (deltaY > 0): step backward
    this.getHorizontalDirections(this.tempForward, this.tempRight);
    const step = -Math.sign(e.deltaY) * 0.35;
    this.position.addScaledVector(this.tempForward, step);
    this.clampRoomBounds();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.isActive || this.isTransitioning) return;
    if (this.isInteractionBlocked && this.isInteractionBlocked()) return;

    const active = document.activeElement as HTMLElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

    this.keysPressed.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (!this.isActive) return;
    this.keysPressed.delete(e.code);
  };

  private onWindowBlur = () => {
    this.keysPressed.clear();
    this.isPointerDown = false;
  };

  /**
   * Calculates horizontal forward and right unit vectors from current camera Yaw.
   */
  private getHorizontalDirections(outForward: THREE.Vector3, outRight: THREE.Vector3): void {
    outForward.set(-Math.sin(this.currentYaw), 0, -Math.cos(this.currentYaw)).normalize();
    outRight.set(Math.cos(this.currentYaw), 0, -Math.sin(this.currentYaw)).normalize();
  }

  /**
   * Enforces strict room boundaries so camera never clips or walks outside walls.
   */
  private clampRoomBounds(): void {
    const b = GlbFreeExplorationController.ROOM_BOUNDS;
    this.position.x = Math.max(b.minX, Math.min(b.maxX, this.position.x));
    this.position.y = Math.max(b.minY, Math.min(b.maxY, this.position.y));
    this.position.z = Math.max(b.minZ, Math.min(b.maxZ, this.position.z));
  }

  /**
   * Activates First-Person 360 Free Exploration Mode inside the room.
   */
  public enter(
    targetPos: THREE.Vector3 = GlbFreeExplorationController.DEFAULT_ROOM_POSITION,
    targetLookAt: THREE.Vector3 = GlbFreeExplorationController.DEFAULT_ROOM_TARGET,
    animate: boolean = true
  ): void {
    this.isActive = true;
    this.keysPressed.clear();
    this.isPointerDown = false;

    // Calculate target Yaw and Pitch looking from targetPos to targetLookAt
    const dir = targetLookAt.clone().sub(targetPos).normalize();
    const destYaw = Math.atan2(-dir.x, -dir.z);
    const destPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));

    if (animate) {
      this.isTransitioning = true;
      this.transitionStartTime = performance.now();
      this.transitionDuration = 750;

      this.transitionStartPos.copy(this.camera.position);
      this.transitionEndPos.copy(targetPos);

      // Get current camera Yaw and Pitch
      const curDir = new THREE.Vector3();
      this.camera.getWorldDirection(curDir);
      this.transitionStartYaw = Math.atan2(-curDir.x, -curDir.z);
      this.transitionStartPitch = Math.asin(Math.max(-1, Math.min(1, curDir.y)));

      // Ensure shortest angular interpolation path
      let diffYaw = destYaw - this.transitionStartYaw;
      while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
      while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
      this.transitionEndYaw = this.transitionStartYaw + diffYaw;
      this.transitionEndPitch = destPitch;
    } else {
      this.position.copy(targetPos);
      this.clampRoomBounds();

      this.currentYaw = destYaw;
      this.targetYaw = destYaw;
      this.currentPitch = destPitch;
      this.targetPitch = destPitch;

      this.camera.position.copy(this.position);
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.set(this.currentPitch, this.currentYaw, 0);
    }

    this.emitter.emit('camera:free-glb-mode-changed', true);
  }

  /**
   * Deactivates Free Exploration Mode.
   */
  public exit(): void {
    this.isActive = false;
    this.isTransitioning = false;
    this.isPointerDown = false;
    this.keysPressed.clear();
    this.emitter.emit('camera:free-glb-mode-changed', false);
  }

  public focusPoint(pos: THREE.Vector3, lookAt: THREE.Vector3): void {
    this.enter(pos, lookAt, true);
  }

  public update(delta: number): void {
    if (!this.isActive) return;

    // 1. Smooth Transition tween
    if (this.isTransitioning) {
      const elapsed = performance.now() - this.transitionStartTime;
      const progress = Math.min(1.0, elapsed / this.transitionDuration);
      // Smooth Hermite easing
      const eased = progress * progress * (3 - 2 * progress);

      this.position.lerpVectors(this.transitionStartPos, this.transitionEndPos, eased);
      this.currentYaw = THREE.MathUtils.lerp(this.transitionStartYaw, this.transitionEndYaw, eased);
      this.currentPitch = THREE.MathUtils.lerp(this.transitionStartPitch, this.transitionEndPitch, eased);
      this.targetYaw = this.currentYaw;
      this.targetPitch = this.currentPitch;

      this.camera.position.copy(this.position);
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.set(this.currentPitch, this.currentYaw, 0);

      if (progress >= 1.0) {
        this.isTransitioning = false;
        this.clampRoomBounds();
      }
      return;
    }

    // 2. Keyboard Navigation (WASD / Arrows / Space / Shift / Q / E / C)
    if (this.keysPressed.size > 0) {
      this.getHorizontalDirections(this.tempForward, this.tempRight);
      this.moveVec.set(0, 0, 0);

      const isSprint = this.keysPressed.has('ShiftLeft') || this.keysPressed.has('ShiftRight');
      const currentSpeed = this.moveSpeed * (isSprint ? 1.75 : 1.0) * delta;

      if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) {
        this.moveVec.add(this.tempForward);
      }
      if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) {
        this.moveVec.sub(this.tempForward);
      }
      if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) {
        this.moveVec.sub(this.tempRight);
      }
      if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) {
        this.moveVec.add(this.tempRight);
      }
      if (this.keysPressed.has('Space') || this.keysPressed.has('KeyE')) {
        this.moveVec.y += 1.0;
      }
      if (this.keysPressed.has('KeyC') || this.keysPressed.has('KeyQ')) {
        this.moveVec.y -= 1.0;
      }

      if (this.moveVec.lengthSq() > 0) {
        this.moveVec.normalize().multiplyScalar(currentSpeed);
        this.position.add(this.moveVec);
        this.clampRoomBounds();
      }
    }

    // 3. Smooth First-Person 360 Look Damping
    const damp = Math.min(1.0, delta * this.dampingFactor);
    this.currentYaw += (this.targetYaw - this.currentYaw) * damp;
    this.currentPitch += (this.targetPitch - this.currentPitch) * damp;

    // 4. Update Camera Position & Rotation directly (Pivot point is user's eye, Radius = 0)
    this.camera.position.copy(this.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(this.currentPitch, this.currentYaw, 0);
  }

  public dispose(): void {
    this.exit();
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);

    this.domElement.removeEventListener('wheel', this.onWheel);
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
  }
}
