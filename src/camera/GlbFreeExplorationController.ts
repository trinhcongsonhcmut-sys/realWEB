import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EventEmitter } from '../core/EventEmitter';

export class GlbFreeExplorationController {
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public emitter: EventEmitter;
  public controls: OrbitControls;

  public isActive: boolean = false;
  public isTransitioning: boolean = false;

  // Keyboard navigation
  private keysPressed: Set<string> = new Set();
  public moveSpeed: number = 3.2; // meters/sec
  public isInteractionBlocked?: () => boolean;

  // Transition tweening
  private transitionStartPos: THREE.Vector3 = new THREE.Vector3();
  private transitionEndPos: THREE.Vector3 = new THREE.Vector3();
  private transitionStartTarget: THREE.Vector3 = new THREE.Vector3();
  private transitionEndTarget: THREE.Vector3 = new THREE.Vector3();
  private transitionStartTime: number = 0;
  private transitionDuration: number = 950;

  // Reusable vectors for performance
  private tempDir: THREE.Vector3 = new THREE.Vector3();
  private tempRight: THREE.Vector3 = new THREE.Vector3();
  private moveVec: THREE.Vector3 = new THREE.Vector3();

  // Default living room vantage point & center target
  public static readonly DEFAULT_ROOM_POSITION = new THREE.Vector3(0.0, 1.65, 0.5);
  public static readonly DEFAULT_ROOM_TARGET = new THREE.Vector3(0.0, 1.25, -2.4);

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement, emitter: EventEmitter) {
    this.camera = camera;
    this.domElement = domElement;
    this.emitter = emitter;

    // Initialize Three.js OrbitControls
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.screenSpacePanning = true; // Right-click pans laterally & vertically
    this.controls.minDistance = 0.15; // Allows inspecting fine furniture textures
    this.controls.maxDistance = 35.0;
    this.controls.rotateSpeed = 0.75;
    this.controls.panSpeed = 0.85;
    this.controls.zoomSpeed = 1.0;
    this.controls.minPolarAngle = 0.01; // Can look straight up at ceiling & chandelier
    this.controls.maxPolarAngle = Math.PI - 0.01; // Can look straight down at flooring & rug

    // Start disabled until user activates "Khám phá ngay"
    this.controls.enabled = false;

    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
    this.domElement.addEventListener('contextmenu', this.onContextMenu);
  }

  private onContextMenu = (e: MouseEvent) => {
    if (this.isActive) {
      e.preventDefault(); // Enable right-click dragging for smooth panning
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.isActive) return;

    // Ignore if typing inside input, textarea or search
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
  };

  /**
   * Activates full 360 GLB Free Exploration Mode inside the room.
   */
  public enter(
    targetPos: THREE.Vector3 = GlbFreeExplorationController.DEFAULT_ROOM_POSITION,
    targetLookAt: THREE.Vector3 = GlbFreeExplorationController.DEFAULT_ROOM_TARGET,
    animate: boolean = true
  ): void {
    this.isActive = true;
    this.keysPressed.clear();

    if (animate) {
      this.isTransitioning = true;
      this.transitionStartTime = performance.now();
      this.transitionDuration = 900;

      this.transitionStartPos.copy(this.camera.position);
      this.transitionEndPos.copy(targetPos);

      // Current look target from camera forward direction
      const currentDir = new THREE.Vector3();
      this.camera.getWorldDirection(currentDir);
      this.transitionStartTarget.copy(this.camera.position).addScaledVector(currentDir, 4.0);
      this.transitionEndTarget.copy(targetLookAt);

      this.controls.enabled = false;
    } else {
      this.camera.position.copy(targetPos);
      this.controls.target.copy(targetLookAt);
      this.camera.lookAt(targetLookAt);
      this.controls.enabled = true;
      this.controls.update();
    }

    this.emitter.emit('camera:free-glb-mode-changed', true);
  }

  /**
   * Deactivates GLB Free Exploration Mode.
   */
  public exit(): void {
    this.isActive = false;
    this.isTransitioning = false;
    this.controls.enabled = false;
    this.keysPressed.clear();
    this.emitter.emit('camera:free-glb-mode-changed', false);
  }

  /**
   * Focuses camera on a specific object or point while in free exploration.
   */
  public focusPoint(pos: THREE.Vector3, lookAt: THREE.Vector3): void {
    this.enter(pos, lookAt, true);
  }

  public update(delta: number): void {
    if (!this.isActive) return;

    // 1. Smooth Transition tween
    if (this.isTransitioning) {
      const elapsed = performance.now() - this.transitionStartTime;
      const progress = Math.min(1.0, elapsed / this.transitionDuration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(this.transitionStartPos, this.transitionEndPos, eased);
      const currentLook = new THREE.Vector3().lerpVectors(
        this.transitionStartTarget,
        this.transitionEndTarget,
        eased
      );
      this.camera.lookAt(currentLook);

      if (progress >= 1.0) {
        this.isTransitioning = false;
        this.controls.target.copy(this.transitionEndTarget);
        this.controls.enabled = true;
        this.controls.update();
      }
      return;
    }

    // Check if external module (e.g. dragging furniture) temporarily blocks orbit
    if (this.isInteractionBlocked && this.isInteractionBlocked()) {
      this.controls.enabled = false;
      return;
    } else {
      this.controls.enabled = true;
    }

    // 2. Keyboard Navigation (WASD / Arrows / Space / Shift / Q / E / C)
    if (this.keysPressed.size > 0) {
      this.camera.getWorldDirection(this.tempDir);
      this.tempDir.y = 0;
      this.tempDir.normalize();

      this.tempRight.crossVectors(this.tempDir, this.camera.up).normalize();
      this.moveVec.set(0, 0, 0);

      const isSprint = this.keysPressed.has('ShiftLeft') || this.keysPressed.has('ShiftRight');
      const currentSpeed = this.moveSpeed * (isSprint ? 2.0 : 1.0) * delta;

      if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) {
        this.moveVec.add(this.tempDir);
      }
      if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) {
        this.moveVec.sub(this.tempDir);
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
        this.camera.position.add(this.moveVec);
        this.controls.target.add(this.moveVec);
      }
    }

    // 3. Update Orbit Controls damping and position
    this.controls.update();
  }

  public dispose(): void {
    this.exit();
    this.controls.dispose();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);
  }
}
