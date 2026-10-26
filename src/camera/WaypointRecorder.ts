import * as THREE from 'three';
import { CameraWaypointConfig, HouseNavigationConfig } from '../config/houseNavigationConfig';
import { CameraStateMachine } from './CameraStateMachine';
import { EventEmitter } from '../core/EventEmitter';

export class WaypointRecorder {
  public camera: THREE.PerspectiveCamera;
  public stateMachine: CameraStateMachine;
  public emitter: EventEmitter;

  public isFreeFlightMode: boolean = false;
  public recordedWaypoints: CameraWaypointConfig[] = [];

  // Free flight controls
  private moveSpeed: number = 0.15;
  private keysPressed: Set<string> = new Set();
  private lookYaw: number = 0;
  private lookPitch: number = 0;
  private isPointerDown: boolean = false;
  private prevPointerX: number = 0;
  private prevPointerY: number = 0;

  constructor(camera: THREE.PerspectiveCamera, stateMachine: CameraStateMachine, emitter: EventEmitter) {
    this.camera = camera;
    this.stateMachine = stateMachine;
    this.emitter = emitter;

    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.isFreeFlightMode) return;
      this.keysPressed.add(e.code);

      // Shortcut: press 'P' to record point
      if (e.code === 'KeyP') {
        this.captureCurrentPoint();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed.delete(e.code);
    });

    window.addEventListener('pointerdown', (e) => {
      if (!this.isFreeFlightMode) return;
      const target = e.target as HTMLElement;
      if (target.closest('button, input, select, textarea, .glass-panel')) return;

      this.isPointerDown = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isFreeFlightMode || !this.isPointerDown) return;
      const dx = e.clientX - this.prevPointerX;
      const dy = e.clientY - this.prevPointerY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      this.lookYaw += dx * 0.0035;
      this.lookPitch = Math.max(-Math.PI * 0.44, Math.min(Math.PI * 0.44, this.lookPitch + dy * 0.0035));
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });
  }

  public toggleFreeFlight(enable?: boolean): boolean {
    this.isFreeFlightMode = enable !== undefined ? enable : !this.isFreeFlightMode;

    if (this.isFreeFlightMode) {
      // Sync look angles from current camera direction
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      this.lookYaw = Math.atan2(dir.x, dir.z);
      this.lookPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
    } else {
      this.keysPressed.clear();
      this.isPointerDown = false;
    }

    return this.isFreeFlightMode;
  }

  public captureCurrentPoint(description?: string): CameraWaypointConfig {
    const pos = this.camera.position;
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const target = pos.clone().addScaledVector(dir, 4.0);

    const wp: CameraWaypointConfig = {
      position: [
        parseFloat(pos.x.toFixed(2)),
        parseFloat(pos.y.toFixed(2)),
        parseFloat(pos.z.toFixed(2))
      ],
      target: [
        parseFloat(target.x.toFixed(2)),
        parseFloat(target.y.toFixed(2)),
        parseFloat(target.z.toFixed(2))
      ],
      description: description || `Điểm ${this.recordedWaypoints.length + 1}`
    };

    this.recordedWaypoints.push(wp);
    this.emitter.emit('recorder:waypoints-updated', this.recordedWaypoints);
    return wp;
  }

  public deletePoint(index: number): void {
    if (index >= 0 && index < this.recordedWaypoints.length) {
      this.recordedWaypoints.splice(index, 1);
      this.emitter.emit('recorder:waypoints-updated', this.recordedWaypoints);
    }
  }

  public clearPoints(): void {
    this.recordedWaypoints = [];
    this.emitter.emit('recorder:waypoints-updated', this.recordedWaypoints);
  }

  public testRecordedPath(): void {
    if (this.recordedWaypoints.length < 2) {
      alert('Vui lòng lưu ít nhất 2 điểm Waypoint để tạo đường dẫn!');
      return;
    }

    // Exit free flight
    this.toggleFreeFlight(false);

    // Create temporary config
    const testConfig: HouseNavigationConfig = {
      ...this.stateMachine.config,
      pathWaypoints: [...this.recordedWaypoints]
    };

    this.stateMachine.pathController.updateConfig(testConfig);
    this.stateMachine.transitionToExteriorPath(0.0);
  }

  public exportConfigCode(houseId: string = 'custom-house-01'): string {
    return JSON.stringify(
      {
        houseId,
        pathWaypoints: this.recordedWaypoints,
        doorOpenStartProgress: 0.58,
        doorOpenCompleteProgress: 0.8
      },
      null,
      2
    );
  }

  public update(delta: number): void {
    if (!this.isFreeFlightMode) return;

    // Free flight keyboard navigation (WASD / Arrow keys / Space / Shift)
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const move = new THREE.Vector3();

    const speed = this.moveSpeed * (this.keysPressed.has('ShiftLeft') ? 2.5 : 1.0);

    if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) move.add(forward);
    if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) move.sub(forward);
    if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) move.add(right);
    if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) move.sub(right);
    if (this.keysPressed.has('Space')) move.y += 1.0;
    if (this.keysPressed.has('KeyC')) move.y -= 1.0;

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed);
      this.camera.position.add(move);
    }

    // Update orientation from yaw and pitch
    const cosPitch = Math.cos(this.lookPitch);
    const dirX = Math.sin(this.lookYaw) * cosPitch;
    const dirY = Math.sin(this.lookPitch);
    const dirZ = Math.cos(this.lookYaw) * cosPitch;

    const lookTarget = new THREE.Vector3(
      this.camera.position.x + dirX * 5.0,
      this.camera.position.y + dirY * 5.0,
      this.camera.position.z + dirZ * 5.0
    );

    this.camera.lookAt(lookTarget);
  }
}
