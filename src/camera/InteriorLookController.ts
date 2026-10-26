import * as THREE from 'three';
import { HouseNavigationConfig } from '../config/houseNavigationConfig';

export class InteriorLookController {
  public config: HouseNavigationConfig;
  public camera: THREE.PerspectiveCamera;

  public isEnabled: boolean = false;

  // Station / Camera position inside the living room & house
  public stationPosition: THREE.Vector3 = new THREE.Vector3(0.0, 1.55, -0.6);

  // Euler angles with 'YXZ' order for gimbal-lock-free 360 rotation
  public currentYaw: number = 0;
  public targetYaw: number = 0;
  public currentPitch: number = 0;
  public targetPitch: number = 0;

  // Mouse drag state
  private isDragging: boolean = false;
  private dragButton: number = 0; // 0 = rotate 360, 2 = pan
  private prevPointerX: number = 0;
  private prevPointerY: number = 0;

  // Keyboard navigation
  private keysPressed: Set<string> = new Set();
  public walkSpeed: number = 2.8; // m/s (natural walking speed)

  constructor(camera: THREE.PerspectiveCamera, config: HouseNavigationConfig) {
    this.camera = camera;
    this.config = config;

    const start = config.interiorLook?.stationPoint || [0.0, 1.55, -0.6];
    this.stationPosition.set(start[0], start[1], start[2]);
  }

  public activate(initialArrivalLookDirection?: THREE.Vector3, customStationPos?: THREE.Vector3): void {
    this.isEnabled = true;
    this.camera.rotation.order = 'YXZ';

    if (customStationPos) {
      this.stationPosition.copy(customStationPos);
    } else if (this.config.interiorLook?.stationPoint) {
      this.stationPosition.set(
        this.config.interiorLook.stationPoint[0],
        this.config.interiorLook.stationPoint[1],
        this.config.interiorLook.stationPoint[2]
      );
    }

    this.clampRoomBounds();
    this.camera.position.copy(this.stationPosition);

    if (initialArrivalLookDirection) {
      const dir = initialArrivalLookDirection.clone().normalize();
      this.currentYaw = Math.atan2(-dir.x, -dir.z);
      this.targetYaw = this.currentYaw;

      this.currentPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
      this.targetPitch = this.currentPitch;
    } else {
      const initTarget = new THREE.Vector3(
        this.config.interiorLook.initialTarget[0] ?? 0.75,
        this.config.interiorLook.initialTarget[1] ?? 1.45,
        this.config.interiorLook.initialTarget[2] ?? -2.0
      );
      const dir = initTarget.sub(this.stationPosition).normalize();
      this.currentYaw = Math.atan2(-dir.x, -dir.z);
      this.targetYaw = this.currentYaw;

      this.currentPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
      this.targetPitch = this.currentPitch;
    }

    this.camera.rotation.set(this.currentPitch, this.currentYaw, 0);
  }

  public deactivate(): void {
    this.isEnabled = false;
    this.isDragging = false;
    this.keysPressed.clear();
  }

  public onPointerDown(clientX: number, clientY: number, button: number = 0): void {
    if (!this.isEnabled) return;
    this.isDragging = true;
    this.dragButton = button;
    this.prevPointerX = clientX;
    this.prevPointerY = clientY;
  }

  public onPointerMove(clientX: number, clientY: number): void {
    if (!this.isEnabled || !this.isDragging) return;

    const deltaX = clientX - this.prevPointerX;
    const deltaY = clientY - this.prevPointerY;
    this.prevPointerX = clientX;
    this.prevPointerY = clientY;

    if (this.dragButton === 2) {
      // Pan camera sideways and vertically (Right-click drag)
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentYaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentYaw);

      const panSpeed = 0.005;
      this.stationPosition.addScaledVector(right, -deltaX * panSpeed);
      this.stationPosition.y += deltaY * panSpeed;
      this.clampRoomBounds();
    } else {
      // 360-degree look (Left-click drag or touch)
      const sensitivity = this.config.interiorLook?.lookSensitivity || 0.0032;

      this.targetYaw -= deltaX * sensitivity;
      this.targetPitch -= deltaY * sensitivity;

      // Clamp vertical pitch [-82°, +82°] to allow looking straight up at chandelier and down at floor
      const maxPitch = Math.PI * 0.45;
      const minPitch = -Math.PI * 0.45;
      this.targetPitch = Math.max(minPitch, Math.min(maxPitch, this.targetPitch));
    }
  }

  public onPointerUp(): void {
    this.isDragging = false;
  }

  /**
   * Mouse wheel walking forward/backward in the direction the camera is facing.
   */
  public onWheel(deltaY: number): void {
    if (!this.isEnabled) return;

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentYaw);
    const step = deltaY < 0 ? 0.40 : -0.40; // Wheel up moves forward, wheel down moves backward
    this.stationPosition.addScaledVector(forward, step);
    this.clampRoomBounds();
  }

  public onKeyDown(code: string): void {
    if (!this.isEnabled) return;
    this.keysPressed.add(code);
  }

  public onKeyUp(code: string): void {
    this.keysPressed.delete(code);
  }

  /**
   * Restricts camera movement within the house interior boundaries so the user doesn't clip out.
   */
  private clampRoomBounds(): void {
    // Living room, sofa, TV, hallway, and kitchen area bounds
    this.stationPosition.x = Math.max(-1.8, Math.min(5.2, this.stationPosition.x));
    this.stationPosition.y = Math.max(1.2, Math.min(2.0, this.stationPosition.y));
    this.stationPosition.z = Math.max(-8.5, Math.min(1.25, this.stationPosition.z));
  }

  public update(delta: number): void {
    if (!this.isEnabled) return;

    // 1. Keyboard walking (WASD / Arrows / Space / Shift)
    if (this.keysPressed.size > 0) {
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentYaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentYaw);
      const move = new THREE.Vector3();

      const isSprint = this.keysPressed.has('ShiftLeft') || this.keysPressed.has('ShiftRight');
      const speed = this.walkSpeed * (isSprint ? 1.8 : 1.0) * delta;

      if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) move.add(forward);
      if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) move.sub(forward);
      if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) move.sub(right);
      if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) move.add(right);
      if (this.keysPressed.has('Space') || this.keysPressed.has('KeyE')) move.y += 1.0;
      if (this.keysPressed.has('KeyC') || this.keysPressed.has('KeyQ')) move.y -= 1.0;

      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(speed);
        this.stationPosition.add(move);
        this.clampRoomBounds();
      }
    }

    // 2. Smooth 360 Look Damping
    const damp = Math.min(1.0, delta * (this.config.interiorLook?.dampingFactor || 14.0));
    this.currentYaw += (this.targetYaw - this.currentYaw) * damp;
    this.currentPitch += (this.targetPitch - this.currentPitch) * damp;

    // 3. Update Camera Position & Rotation
    this.camera.position.copy(this.stationPosition);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(this.currentPitch, this.currentYaw, 0);
  }
}
