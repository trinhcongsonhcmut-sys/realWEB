import * as THREE from 'three';
import { EventEmitter } from './EventEmitter';

export interface InspectedFurnitureItem {
  mesh: THREE.Mesh;
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
        if ((child as THREE.Mesh).isMesh && child.userData.isRoomFurniture) {
          const lower = child.name.toLowerCase();
          // Filter out structural walls, floors, ceilings and windows from being selected
          if (
            lower.includes('foundation') ||
            lower.includes('wall') ||
            lower.includes('celling') ||
            lower.includes('ceiling') ||
            lower.includes('ceramic')
          ) {
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
   * Highlights the selected furniture mesh with a glowing 3D box and displays Vietnamese specs
   */
  public highlightInspectedObject(mesh: THREE.Mesh): void {
    this.inspectedMesh = mesh;
    if (!this.selectionBoxHelper) {
      this.selectionBoxHelper = new THREE.BoxHelper(mesh, 0x38bdf8);
      this.scene.add(this.selectionBoxHelper);
    } else {
      this.selectionBoxHelper.setFromObject(mesh);
      this.selectionBoxHelper.visible = true;
    }

    const itemInfo = this.identifyFurnitureItem(mesh);
    this.emitter.emit('furniture:item-inspected', itemInfo);
    console.log(`[FurnitureManager] Selected room object: ${itemInfo.name} (${itemInfo.category})`);
  }

  /**
   * Categorizes furniture inside livingroom_wabisabi_mix.glb into meaningful Vietnamese names
   */
  private identifyFurnitureItem(mesh: THREE.Mesh): InspectedFurnitureItem {
    // Collect all ancestor names to match node groups
    const names: string[] = [];
    let curr: THREE.Object3D | null = mesh;
    while (curr && curr !== this.customRoomGroup) {
      if (curr.name) names.push(curr.name.toLowerCase());
      curr = curr.parent;
    }
    const combined = names.join(' ');

    let name = 'Vật phẩm nội thất';
    let category = 'Nội thất phòng khách';
    let description = 'Nội thất cao cấp nhập khẩu được bài trí hài hòa theo phong cách Wabi-Sabi tinh tế.';

    if (combined.includes('ghesofa') || combined.includes('sofa')) {
      name = 'Bộ Sofa Wabi-Sabi Bọc Vải Thô Tự Nhiên';
      category = 'Sofa & Ghế ngồi';
      description = 'Bộ sofa nỉ cao cấp phong cách Wabi-Sabi với chất liệu vải dệt thô mộc, đệm mút cao cấp êm ái, tông màu be ấm cúng.';
    } else if (combined.includes('bansofa')) {
      name = 'Bàn Trà Gỗ Tự Nhiên Nguyên Khối Wabi-Sabi';
      category = 'Bàn trà & Coffee Table';
      description = 'Bàn trà tạo tác từ gỗ tự nhiên mộc mạc, giữ nguyên vân gỗ và cạnh gợn tự nhiên đậm chất Zen.';
    } else if (combined.includes('thamsofa') || combined.includes('carpet')) {
      name = 'Thảm Dệt Sợi Thủ Công Tự Nhiên';
      category = 'Vải dệt & Thảm';
      description = 'Thảm dệt thủ công từ sợi gai tự nhiên cao cấp, cách âm, mang lại vẻ mộc mạc và sang trọng cho căn phòng.';
    } else if (combined.includes('ketivi')) {
      name = 'Hệ Kệ Tivi Console Gỗ Tự Nhiên';
      category = 'Kệ tủ & Vách trang trí';
      description = 'Kệ console tivi kết hợp ngăn kéo gỗ mộc tự nhiên, đường nét tối giản tinh tế.';
    } else if (combined.includes('tivi')) {
      name = 'Smart TV OLED 65 inch Siêu Mỏng';
      category = 'Thiết bị giải trí';
      description = 'Màn hình OLED 4K viền siêu mỏng, tích hợp hệ thống Smarthome điều khiển ngôi nhà thông minh.';
    } else if (combined.includes('denban3chan')) {
      name = 'Đèn Bàn 3 Chân Chao Giấy Washi Nhật';
      category = 'Hệ thống chiếu sáng';
      description = 'Chao đèn giấy Washi thủ công Nhật Bản trên khung chân gỗ 3 chấu, tạo ánh sáng khuếch tán dịu nhẹ.';
    } else if (combined.includes('dencao')) {
      name = 'Đèn Cây Đứng Wabi-Sabi Độc Bản';
      category = 'Hệ thống chiếu sáng';
      description = 'Đèn cây đứng cao 1.6m chao giấy thủ công, điểm nhấn ánh sáng nghệ thuật cho góc thư giãn đọc sách.';
    } else if (combined.includes('dentreotron')) {
      name = 'Đèn Thả Trần Chao Cầu Kim Loại Vàng Ánh Kim';
      category = 'Hệ thống chiếu sáng';
      description = 'Cụm đèn thả trần hình cầu kim loại ánh kim phối cùng bóng LED ấm 3000K sang trọng.';
    } else if (combined.includes('caytrongnha')) {
      name = 'Chậu Cây Cảnh Bonsai Phong Cách Zen';
      category = 'Không gian xanh & Tiểu cảnh';
      description = 'Chậu gốm mộc trồng cây cảnh thanh lọc không khí, mang thiên nhiên tươi mát vào không gian sống.';
    } else if (combined.includes('tranh') || combined.includes('poster')) {
      name = 'Tranh Nghệ Thuật Trừu Tượng Tối Giản Wabi-Sabi';
      category = 'Tranh treo tường & Decor';
      description = 'Tác phẩm tranh canvas tối giản tôn vinh vẻ đẹp bình yên và mộc mạc trong nghệ thuật sắp đặt.';
    } else if (combined.includes('dotrangtri')) {
      name = 'Bộ Gốm Men Mộc Thủ Công & Sách Nghệ Thuật';
      category = 'Phụ kiện Decor';
      description = 'Bộ bình gốm thủ công mộc, cành khô cắm nghệ thuật và sách kiến trúc decor tinh tế.';
    } else if (combined.includes('kitchen') || combined.includes('inter_kitchen')) {
      name = 'Hệ Tủ Bếp & Đảo Bếp Gỗ Tự Nhiên Đương Đại';
      category = 'Khu vực Bếp & Bar';
      description = 'Hệ tủ bếp liên thông hiện đại, mặt bàn đá tự nhiên chống xước kết hợp quầy bar gia đình sang trọng.';
    } else if (combined.includes('rem')) {
      name = 'Rèm Vải Linen Tự Nhiên Hai Lớp';
      category = 'Rèm cửa & Phụ kiện';
      description = 'Rèm cửa vải lanh Linen tự nhiên buông rủ, cản nắng nhẹ nhàng và tạo độ mềm mại cho không gian.';
    } else if (combined.includes('bancong') || combined.includes('glassdoor')) {
      name = 'Hệ Cửa Kính Ban Công Lớn Đón Sáng Tự Nhiên';
      category = 'Cửa & Ban công';
      description = 'Hệ cửa lùa kính cường lực khung nhôm xingfa đón trọn ánh sáng tự nhiên và gió trời thông thoáng.';
    } else if (combined.includes('wall_wood')) {
      name = 'Vách Ốp Lam Gỗ Tự Nhiên Cao Cấp';
      category = 'Vách trang trí';
      description = 'Hệ nan gỗ sồi tự nhiên cách điệu, tăng chiều sâu và vẻ ấm áp cho không gian phòng khách.';
    } else if (combined.includes('foundation') || combined.includes('ceramic')) {
      name = 'Sàn Gốm Ceramic Phong Cách Wabi-Sabi';
      category = 'Sàn & Hoàn thiện';
      description = 'Gạch ceramic men mờ cao cấp chống trơn trượt, tông màu đất ấm áp bền vững theo thời gian.';
    } else if (combined.includes('celling') || combined.includes('ceiling')) {
      name = 'Trần Thạch Cao Giật Cấp Tích Hợp LED Hắt';
      category = 'Trần nhà & Chiếu sáng';
      description = 'Trần thạch cao phẳng kết hợp khe hắt LED vàng ấm 3000K gián tiếp êm dịu mắt.';
    } else {
      // Geometric fallback
      const box = new THREE.Box3().setFromObject(mesh);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);

      if (center.y > 2.0) {
        name = 'Đèn treo trần nghệ thuật';
        category = 'Hệ thống chiếu sáng';
        description = 'Hệ thống đèn thả trần ánh sáng vàng ấm 3000K tiết kiệm điện.';
      } else if (size.y < 0.15 && (size.x > 1.0 || size.z > 1.0)) {
        name = 'Thảm sàn dệt tự nhiên';
        category = 'Vải dệt & Thảm';
        description = 'Thảm sàn phong cách Wabi-Sabi mộc mạc cao cấp.';
      } else {
        name = 'Chi tiết trang trí Wabi-Sabi';
        category = 'Phụ kiện Decor';
        description = 'Chi tiết trang trí thủ công tinh tế tôn vinh vẻ đẹp ngôi nhà.';
      }
    }

    return {
      mesh,
      name,
      category,
      description
    };
  }

  public update(_delta: number): void {
    // Keep selection helper updated if object transforms
    if (this.selectionBoxHelper && this.selectionBoxHelper.visible && this.inspectedMesh) {
      this.selectionBoxHelper.setFromObject(this.inspectedMesh);
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
