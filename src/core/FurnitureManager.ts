import * as THREE from 'three';
import { EventEmitter } from './EventEmitter';
import { CustomMaterialOption } from '../staging/DynamicCustomizerStore';
import { TextureLoaderService } from '../staging/TextureLoaderService';

export interface InspectedFurnitureItem {
  mesh: THREE.Mesh;
  objectRoot: THREE.Object3D;
  itemKey: string;
  name: string;
  category: string;
  description: string;
}

export class FurnitureManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public emitter: EventEmitter;

  // Room floor level in the world is y = 0.405
  public floorY: number = 0.405;

  // Custom room reference & Object Inspector
  public customRoomGroup: THREE.Group | null = null;
  public selectionBoxHelper: THREE.BoxHelper | null = null;
  public inspectedMesh: THREE.Mesh | null = null;
  public currentInspectedItem: InspectedFurnitureItem | null = null;

  // Raycasting
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    emitter: EventEmitter
  ) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.emitter = emitter;

    this.bindEvents();

    this.emitter.on('room:custom-mounted', (roomGroup: THREE.Group) => {
      this.customRoomGroup = roomGroup;
      console.log('[FurnitureManager] Custom room mounted for furniture interaction');
    });
  }

  /**
   * Smoothly moves the camera into the center of the living room and triggers 360 view
   */
  public focusOnLivingRoom(): void {
    this.emitter.emit('camera:focus-object', {
      position: [0.0, 1.50, -0.6],
      target: [0.75, 1.45, -2.0]
    });
  }

  private updateMouse(clientX: number, clientY: number): void {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  private isInteractiveUI(el: HTMLElement | null): boolean {
    if (!el) return false;
    return !!el.closest('button, input, a, select, textarea, .auth-modal, .scrollable-ui, .hud-interactive, .furniture-popup, .customizer-panel');
  }

  private pointerDownPos = { x: 0, y: 0 };

  private bindEvents(): void {
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointerup', this.onPointerUp);
  }

  private onPointerDown = (e: PointerEvent) => {
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
  };

  private onPointerUp = (e: PointerEvent) => {
    if (this.isInteractiveUI(e.target as HTMLElement)) return;

    // Only trigger furniture inspection on genuine clicks, NOT on camera rotation drags
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    if (dist > 6) return;

    this.updateMouse(e.clientX, e.clientY);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Raycast against objects inside the mounted living room
    if (this.customRoomGroup) {
      const roomMeshes: THREE.Mesh[] = [];
      this.customRoomGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const lower = child.name.toLowerCase();
          // Filter out ceilings and external roofs
          if (lower.includes('celling') || lower.includes('ceiling') || lower.includes('roof')) {
            return;
          }
          roomMeshes.push(child as THREE.Mesh);
        }
      });

      const roomHits = this.raycaster.intersectObjects(roomMeshes, false);
      if (roomHits.length > 0) {
        const hitMesh = roomHits[0].object as THREE.Mesh;
        this.highlightInspectedObject(hitMesh);
        return;
      }
    }

    // Clicked elsewhere on empty floor/space
    if (this.selectionBoxHelper) {
      this.selectionBoxHelper.visible = false;
    }
  };

  /**
   * Traces up the node hierarchy to find the distinct root item (child of Decor, Base_house, or RootNode)
   */
  public findItemRoot(mesh: THREE.Mesh): THREE.Object3D {
    let curr: THREE.Object3D = mesh;
    while (curr.parent && curr.parent !== this.customRoomGroup) {
      const pName = curr.parent.name;
      if (pName === 'Decor' || pName === 'Base_house' || pName === 'RootNode' || pName === 'Sketchfab_model') {
        return curr;
      }
      curr = curr.parent;
    }
    return mesh;
  }

  /**
   * Highlights the selected furniture mesh and its objectRoot with a glowing 3D box
   */
  public highlightInspectedObject(mesh: THREE.Mesh): void {
    this.inspectedMesh = mesh;
    const itemInfo = this.identifyFurnitureItem(mesh);
    this.currentInspectedItem = itemInfo;

    const targetBoxObject = itemInfo.objectRoot || mesh;
    if (!this.selectionBoxHelper) {
      this.selectionBoxHelper = new THREE.BoxHelper(targetBoxObject, 0x38bdf8);
      this.scene.add(this.selectionBoxHelper);
    } else {
      this.selectionBoxHelper.setFromObject(targetBoxObject);
      this.selectionBoxHelper.visible = true;
    }

    this.emitter.emit('furniture:item-inspected', itemInfo);
    console.log(`[FurnitureManager] Selected room object: ${itemInfo.name} (Key: ${itemInfo.itemKey}, Root: ${itemInfo.objectRoot.name})`);
  }

  /**
   * Categorizes furniture inside livingroom_wabisabi_mix.glb into meaningful Vietnamese names
   */
  private identifyFurnitureItem(mesh: THREE.Mesh): InspectedFurnitureItem {
    const objectRoot = this.findItemRoot(mesh);
    const rootName = (objectRoot.name || mesh.name || '').toLowerCase();

    let itemKey = 'general';
    let name = 'Vật phẩm trang trí';
    let category = 'Nội thất phòng khách';
    let description = 'Nội thất cao cấp phong cách Wabi-Sabi tinh tế.';

    if (rootName.includes('foundation') || rootName.includes('ceramic') || rootName.includes('floor')) {
      itemKey = 'floor';
      name = 'Sàn Nhà Phòng Khách Ceramic';
      category = 'Chất liệu sàn nhà';
      description = 'Mặt sàn phòng khách rộng thoáng, tùy biến gạch men ceramic bóng, sàn gỗ tự nhiên, óc chó hoặc đá cẩm thạch.';
    } else if (rootName.includes('ghesofa')) {
      itemKey = 'ghesofa';
      name = 'Bộ Ghế Sofa Vải Thô Wabi-Sabi';
      category = 'Sofa & Ghế ngồi';
      description = 'Bộ ghế sofa nỉ cao cấp phong cách Wabi-Sabi với chất liệu vải dệt thô mộc, đệm mút cao cấp êm ái, tông màu ấm cúng.';
    } else if (rootName.includes('bansofa')) {
      itemKey = 'bansofa';
      name = 'Bàn Trà Sofa Gỗ Tự Nhiên';
      category = 'Bàn trà & Coffee Table';
      description = 'Bàn trà gỗ nguyên khối mộc mạc, giữ nguyên vân gỗ và cạnh gợn tự nhiên đậm chất Zen.';
    } else if (rootName.includes('thamsofa')) {
      itemKey = 'thamsofa';
      name = 'Thảm Sàn Sợi Gai Dệt Tự Nhiên';
      category = 'Vải dệt & Thảm';
      description = 'Thảm trải sàn dệt từ sợi gai tự nhiên cao cấp, cách âm và tạo điểm nhấn ấm cúng cho phòng khách.';
    } else if (rootName.includes('ketivi')) {
      itemKey = 'ketivi';
      name = 'Hệ Kệ Tủ Tivi Console Gỗ';
      category = 'Kệ tủ & Vách trang trí';
      description = 'Kệ tivi console kết hợp ngăn kéo gỗ mộc tự nhiên, đường nét tối giản thanh lịch.';
    } else if (rootName.includes('tivi')) {
      itemKey = 'tivi';
      name = 'Smart TV OLED 65 inch Siêu Mỏng';
      category = 'Thiết bị giải trí';
      description = 'Màn hình OLED 4K viền kim loại siêu mỏng, tích hợp hệ thống Smarthome điều khiển thông minh.';
    } else if (rootName.includes('dencao')) {
      itemKey = 'dencao';
      name = 'Cây Đèn Đứng Chao Giấy Wabi-Sabi';
      category = 'Hệ thống chiếu sáng';
      description = 'Cây đèn đứng cao 1.6m chao giấy thủ công, điểm nhấn ánh sáng nghệ thuật cho góc thư giãn đọc sách.';
    } else if (rootName.includes('denban3chan')) {
      itemKey = 'denban3chan';
      name = 'Đèn Bàn 3 Chân Chao Giấy Washi';
      category = 'Hệ thống chiếu sáng';
      description = 'Chao đèn giấy Washi thủ công Nhật Bản trên khung chân gỗ 3 chấu, tạo ánh sáng khuếch tán dịu nhẹ.';
    } else if (rootName.includes('dentreotron')) {
      itemKey = 'dentreotron';
      name = 'Đèn Thả Trần Chao Cầu Ánh Kim';
      category = 'Hệ thống chiếu sáng';
      description = 'Cụm đèn thả trần hình cầu kim loại ánh kim phối cùng bóng LED ấm 3000K sang trọng.';
    } else if (rootName.includes('caytrongnha')) {
      itemKey = 'caytrongnha';
      name = 'Chậu Cây Cảnh Bonsai Phong Cách Zen';
      category = 'Không gian xanh & Tiểu cảnh';
      description = 'Chậu gốm mộc trồng cây cảnh thanh lọc không khí, mang thiên nhiên tươi mát vào không gian sống.';
    } else if (rootName.includes('tranh')) {
      itemKey = 'tranh';
      name = 'Tranh Treo Tường Nghệ Thuật Wabi-Sabi';
      category = 'Tranh treo tường & Decor';
      description = 'Tác phẩm tranh canvas nghệ thuật tối giản tôn vinh vẻ đẹp bình yên và mộc mạc.';
    } else if (rootName.includes('rem')) {
      itemKey = 'rem';
      name = 'Rèm Cửa Vải Linen Tự Nhiên 2 Lớp';
      category = 'Rèm cửa & Phụ kiện';
      description = 'Rèm cửa vải lanh Linen tự nhiên buông rủ, cản nắng nhẹ nhàng và tạo độ mềm mại cho không gian.';
    } else if (rootName.includes('dotrangtri')) {
      itemKey = 'dotrangtri';
      name = 'Bộ Bình Gốm Men Mộc & Sách Decor';
      category = 'Phụ kiện Decor';
      description = 'Bộ bình gốm thủ công mộc, cành khô cắm nghệ thuật và sách kiến trúc decor tinh tế.';
    } else if (rootName.includes('kitchen') || rootName.includes('inter_kitchen')) {
      itemKey = 'kitchen';
      name = 'Hệ Tủ Bếp & Đảo Bếp Gỗ Đương Đại';
      category = 'Khu vực Bếp & Bar';
      description = 'Hệ tủ bếp liên thông hiện đại, mặt bàn đá tự nhiên chống xước kết hợp quầy bar sang trọng.';
    } else if (rootName.includes('wall_wood')) {
      itemKey = 'wall_wood';
      name = 'Vách Ốp Lam Gỗ Trang Trí';
      category = 'Vách trang trí';
      description = 'Hệ nan gỗ sồi tự nhiên cách điệu, tăng chiều sâu và vẻ ấm áp cho không gian phòng khách.';
    } else if (rootName.includes('bancong') || rootName.includes('glassdoor') || rootName.includes('frontwall')) {
      itemKey = 'cuabancong';
      name = 'Hệ Cửa Kính Lùa Ban Công';
      category = 'Cửa & Ban công';
      description = 'Hệ cửa lùa kính cường lực khung nhôm đón trọn ánh sáng tự nhiên và gió trời thông thoáng.';
    }

    return {
      mesh,
      objectRoot,
      itemKey,
      name,
      category,
      description
    };
  }

  /**
   * Applies a color strictly to the currently inspected item objectRoot without bleeding into other objects
   */
  public changeInspectedColor(hex: string, roughness: number = 0.5, metalness: number = 0.0): void {
    const isFloor = this.currentInspectedItem?.itemKey === 'floor';
    if (isFloor && this.customRoomGroup) {
      this.customRoomGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const lower = child.name.toLowerCase();
          if (lower.includes('foundation') || lower.includes('ceramic') || lower.includes('floor')) {
            this.setMeshColor(child as THREE.Mesh, hex, roughness, metalness);
          }
        }
      });
      return;
    }

    const targetRoot = this.currentInspectedItem?.objectRoot || this.inspectedMesh;
    if (!targetRoot) return;

    targetRoot.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        this.setMeshColor(child as THREE.Mesh, hex, roughness, metalness);
      }
    });
  }

  public applyColorToItemKey(itemKey: string, hex: string, roughness: number = 0.5, metalness: number = 0.0): void {
    if (itemKey === 'floor' && this.customRoomGroup) {
      this.customRoomGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const lower = child.name.toLowerCase();
          if (lower.includes('foundation') || lower.includes('ceramic') || lower.includes('floor')) {
            this.setMeshColor(child as THREE.Mesh, hex, roughness, metalness);
          }
        }
      });
      return;
    }

    if (this.currentInspectedItem && (this.currentInspectedItem.itemKey === itemKey || (itemKey === 'sofa' && this.currentInspectedItem.itemKey === 'ghesofa'))) {
      this.changeInspectedColor(hex, roughness, metalness);
      return;
    }

    if (!this.customRoomGroup) return;

    // Apply strictly to meshes matching this itemKey
    this.customRoomGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const info = this.identifyFurnitureItem(child as THREE.Mesh);
        if (info.itemKey === itemKey || (itemKey === 'sofa' && info.itemKey === 'ghesofa')) {
          this.setMeshColor(child as THREE.Mesh, hex, roughness, metalness);
        }
      }
    });
  }

  /**
   * Applies a material/texture strictly to the currently inspected item objectRoot
   */
  public async changeInspectedMaterial(material: CustomMaterialOption): Promise<void> {
    const isFloor = this.currentInspectedItem?.itemKey === 'floor' || material.id.startsWith('floor-');
    const targetRoot = this.currentInspectedItem?.objectRoot || this.inspectedMesh;
    if (!targetRoot && !this.customRoomGroup) return;

    try {
      const texLoader = TextureLoaderService.getInstance();
      let texture: THREE.Texture | null = null;

      const texUrl = material.textureDataUrl || material.textureUrl;
      if (texUrl) {
        texture = await texLoader.loadTexture(
          texUrl,
          material.repeatX || 4,
          material.repeatY || (isFloor ? 8 : 4)
        );
      } else if (material.type === 'wood' || material.type === 'ceramic' || material.type === 'marble' || material.type === 'fabric') {
        const defaultTint = material.color || (material.type === 'wood' ? '#bfa27a' : material.type === 'marble' ? '#f8fafc' : '#f5f5f7');
        const proc = texLoader.createProceduralTexture(
          material.type,
          defaultTint,
          material.repeatX || 4,
          material.repeatY || (isFloor ? 8 : 4)
        );
        texture = proc.texture;
      }

      const applyToMesh = (m: THREE.Mesh) => {
        if (!m.material) return;
        if (Array.isArray(m.material)) {
          m.material = m.material.map((mat) => {
            const cloned = mat.clone() as THREE.MeshStandardMaterial;
            if (texture) {
              cloned.map = texture;
              cloned.color.set('#ffffff');
            } else if (material.color) {
              cloned.map = null;
              cloned.color.set(material.color);
            }
            cloned.roughness = material.roughness;
            cloned.metalness = material.metalness;
            cloned.needsUpdate = true;
            return cloned;
          });
        } else {
          const cloned = m.material.clone() as THREE.MeshStandardMaterial;
          if (texture) {
            cloned.map = texture;
            cloned.color.set('#ffffff');
          } else if (material.color) {
            cloned.map = null;
            cloned.color.set(material.color);
          }
          cloned.roughness = material.roughness;
          cloned.metalness = material.metalness;
          cloned.needsUpdate = true;
          m.material = cloned;
        }
      };

      if (isFloor && this.customRoomGroup) {
        this.customRoomGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const lower = child.name.toLowerCase();
            if (lower.includes('foundation') || lower.includes('ceramic') || lower.includes('floor')) {
              applyToMesh(child as THREE.Mesh);
            }
          }
        });
      } else if (targetRoot) {
        targetRoot.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            applyToMesh(child as THREE.Mesh);
          }
        });
      }
    } catch (err) {
      console.error('[FurnitureManager] Failed to apply material:', err);
    }
  }

  public async applyMaterialToItemKey(itemKey: string, material: CustomMaterialOption): Promise<void> {
    if (this.currentInspectedItem && (this.currentInspectedItem.itemKey === itemKey || (itemKey === 'sofa' && this.currentInspectedItem.itemKey === 'ghesofa'))) {
      await this.changeInspectedMaterial(material);
      return;
    }

    if (!this.customRoomGroup) return;

    this.customRoomGroup.traverse(async (child) => {
      if ((child as THREE.Mesh).isMesh) {
        const info = this.identifyFurnitureItem(child as THREE.Mesh);
        if (info.itemKey === itemKey || (itemKey === 'sofa' && info.itemKey === 'ghesofa')) {
          this.inspectedMesh = child as THREE.Mesh;
          this.currentInspectedItem = info;
          await this.changeInspectedMaterial(material);
        }
      }
    });
  }

  private setMeshColor(mesh: THREE.Mesh, hex: string, roughness: number, metalness: number): void {
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((mat) => {
          const cloned = mat.clone() as THREE.MeshStandardMaterial;
          cloned.map = null;
          cloned.color.set(hex);
          cloned.roughness = roughness;
          cloned.metalness = metalness;
          cloned.needsUpdate = true;
          return cloned;
        });
      } else {
        const cloned = mesh.material.clone() as THREE.MeshStandardMaterial;
        cloned.map = null;
        cloned.color.set(hex);
        cloned.roughness = roughness;
        cloned.metalness = metalness;
        cloned.needsUpdate = true;
        mesh.material = cloned;
      }
    }
  }

  public update(_delta: number): void {
    if (this.selectionBoxHelper && this.selectionBoxHelper.visible) {
      const target = this.currentInspectedItem?.objectRoot || this.inspectedMesh;
      if (target) {
        this.selectionBoxHelper.setFromObject(target);
      }
    }
  }

  public isInteracting(): boolean {
    return false;
  }

  public dispose(): void {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointerup', this.onPointerUp);
    if (this.selectionBoxHelper) {
      this.scene.remove(this.selectionBoxHelper);
      this.selectionBoxHelper.geometry?.dispose();
    }
  }
}
