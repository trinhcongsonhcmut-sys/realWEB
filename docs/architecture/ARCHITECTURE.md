# TÀI LIỆU KIẾN TRÚC HỆ THỐNG NỀN TẢNG WEB 3D BẤT ĐỘNG SẢN
**Tài liệu:** `docs/architecture/ARCHITECTURE.md`  
**Phiên bản:** 1.0.0 (Production-Ready Architecture)  
**Ngày thiết kế:** 24/10/2026  

---

## 1. TỔNG QUAN KIẾN TRÚC TỔNG THỂ

Hệ thống được thiết kế theo mô hình **Phân lớp Độc lập (Decoupled Layered Architecture)** nhằm đảm bảo:
- Logic đồ họa 3D không bị phụ thuộc vào tầng UI giao diện.
- Trải nghiệm đăng nhập không bị cản trở bởi canvas 3D và ngược lại.
- Dễ dàng thay thế, bổ sung hàng trăm căn nhà khác nhau thông qua **Property Metadata Engine**.
- Khả năng nâng cấp, bảo trì dài hạn, mở rộng sang các tính năng thương mại (đặt cọc, tùy biến gói nội thất, kết nối VR/WebXR).

```
+---------------------------------------------------------------------------------------+
|                                    UI LAYER (DOM)                                     |
|  +--------------------+  +--------------------+  +---------------------------------+  |
|  | Header / Branding  |  | Login / Auth Modal |  | Camera / Floorplan Controls     |  |
|  +--------------------+  +--------------------+  +---------------------------------+  |
|  +--------------------+  +--------------------+  +---------------------------------+  |
|  | Property Specs HUD |  | Material Customizer|  | Hotspot Indicators & Tooltips   |  |
|  +--------------------+  +--------------------+  +---------------------------------+  |
+-------------------------------------------+-------------------------------------------+
                                            | (Events, State Sync, Emitters)
                                            v
+---------------------------------------------------------------------------------------+
|                                  APPLICATION CORE                                     |
|  +--------------------+  +--------------------+  +---------------------------------+  |
|  | App State Manager  |  | Property Metadata  |  | Input Dispatcher (Wheel, Touch) |  |
|  +--------------------+  +--------------------+  +---------------------------------+  |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                  3D ENGINE & SCENE                                    |
|  +--------------------+  +--------------------+  +---------------------------------+  |
|  | Scene Graph Manager|  | Camera State Mach. |  | Lighting & Tone Mapping Engine  |  |
|  +--------------------+  +--------------------+  +---------------------------------+  |
|  +--------------------+  +--------------------+  +---------------------------------+  |
|  | Townhouse Builder  |  | Interior Furnishing|  | Collision & Bounds Boundary     |  |
|  +--------------------+  +--------------------+  +---------------------------------+  |
|  +--------------------+  +--------------------+  +---------------------------------+  |
|  | Hotspots Manager   |  | Material Switcher  |  | Resource Disposal / Garbage Col.|  |
|  +--------------------+  +--------------------+  +---------------------------------+  |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                               HARDWARE & WEBGL RUNTIME                                |
|                   WebGL 2.0 / WebGPU Pipeline  •  GPU VRAM Memory                     |
+---------------------------------------------------------------------------------------+
```

---

## 2. CHI TIẾT CÁC MODULE CHÍNH

### 2.1. Module 1: Scene & Rendering Engine (`RealEstateViewer`)
- Khởi tạo `THREE.WebGLRenderer` với `antialias: true`, `powerPreference: "high-performance"`.
- Bật `ACESFilmicToneMapping` và hiệu chỉnh dải sáng `exposure = 1.0`.
- Quản lý vòng lặp Render đồng hồ thời gian thực (`requestAnimationFrame`) với hệ số `delta` độc lập FPS.
- Tự động thay đổi kích thước khung nhìn (`handleResize`) mượt mà theo tỷ lệ màn hình và `devicePixelRatio` (giới hạn tối đa 2.0 để bảo vệ GPU di động).

### 2.2. Module 2: Camera State Machine (`CameraController`)
- Điều phối các trạng thái camera:
  - `EXTERIOR_ORBIT`: Xoay tự do xung quanh ngoại thất ngôi nhà.
  - `APPROACH_TRANSITION`: Camera tiến dần vào sảnh chính theo tiến độ cuộn chuột (`scrollProgress`).
  - `DOOR_PASS`: Camera đi xuyên qua khung cửa vào trong nhà.
  - `INTERIOR_EXPLORATION`: Điều khiển tự do góc nhìn trong phòng (xoay 360°, ngước nhìn trần/sàn).
  - `DOLLHOUSE_VIEW`: Nâng camera lên cao 45°, ẩn mái nhà để quan sát toàn bộ kết cấu cắt lớp các tầng.
  - `FLOORPLAN_VIEW`: Chuyển camera về góc nhìn trực diện từ trên xuống (Top-down) phục vụ xem sơ đồ mặt bằng.

### 2.3. Module 3: Townhouse & Interior Builder (`TownhouseBuilder`)
- Xây dựng mô hình nhà phố 2 tầng hiện đại chuẩn kiến trúc:
  - **Mặt tiền & Vỏ kiến trúc (Shell):** Tường hoàn thiện sơn trắng ngà cao cấp, ốp lam gỗ conwood trang trí, ban công kính cường lực trong suốt, hệ cửa kính nhôm Xingfa sơn tĩnh điện màu xám đen sang trọng.
  - **Hệ thống cửa ra vào:** Cánh cửa chính có bản lề xoay vật lý, mở dần ra khi camera tiến gần.
  - **Phân chia không gian:**
    - Tầng trệt: Sảnh đón, Phòng khách sang trọng (bộ sofa hiện đại, bàn trà mặt đá, thảm dệt, kệ tivi trang trí, tranh treo tường), Khu vực bếp ăn hiện đại, Cầu thang thông tầng.
    - Tầng lầu: Phòng ngủ Master có giường nệm cao cấp, tủ quần áo âm tường, bàn làm việc, ban công ngắm phố.
    - Sân vườn nhỏ phía trước có cây xanh cảnh quan và lối đi lát đá bazan.

### 2.4. Module 4: Hệ thống Ánh sáng Chuyên nghiệp (`LightingManager`)
- **Nguồn sáng mặt trời chính (`sunLight`):** `DirectionalLight` với góc chiếu xiên 45°, tạo bóng đổ mềm tự nhiên (Soft Shadows) trên mặt tiền.
- **Ánh sáng môi trường (`skyLight`):** `HemisphereLight` tái hiện ánh sáng tán xạ từ bầu trời xanh và mặt đất ấm.
- **Hệ thống đèn nội thất (`interiorLights`):** Các điểm sáng ấm (Warm LED 3200K) lắp đặt âm trần và đèn cây trang trí trong phòng khách, tự động kích hoạt khi bước vào nhà.

### 2.5. Module 5: Cấu hình Vật liệu & Tùy biến (`MaterialConfigurator`)
- Cho phép người dùng chuyển đổi vật liệu nội thất thời gian thực:
  - Màu sắc vải sofa: Xám ghi cao cấp, Xanh ngọc navy, Be cát ấm áp.
  - Chất liệu sàn nhà: Sàn gỗ sồi tự nhiên, Gạch men đá hoa cương Marble bóng kiếng, Xi măng mài hiện đại.
  - Màu sơn tường nội thất: Trắng khói, Ghi nhạt Scandinavian, Xanh pastel thanh lịch.

### 2.6. Module 6: Quản lý Điểm tương tác (`HotspotsManager`)
- Hiển thị các điểm đánh dấu (Interactive 3D Hotspots) gắn trong không gian 3D:
  - Nhấp vào "Phòng khách" -> Camera di chuyển mượt mà tới vị trí sofa.
  - Nhấp vào "Khu vực bếp" -> Di chuyển tới đảo bếp.
  - Nhấp vào "Phòng ngủ lầu 1" -> Camera chuyển lên tầng 2.
  - Nhấp vào "Ban công" -> Quan sát tầm nhìn bên ngoài từ tầng 2.

### 2.7. Module 7: Giao diện Người dùng & Trải nghiệm Đăng nhập (`UIController`)
- Được thiết kế theo phong cách **Luxury Minimalist Glassmorphism**:
  - Không che khuất ngôi nhà 3D.
  - Cung cấp nút chuyển đổi chế độ xem: Ngoại thất, Nội thất, Cắt lớp Dollhouse, Mặt bằng Floor Plan.
  - Form Đăng nhập / Đăng ký tinh tế, có thể thu gọn, mở rộng hoặc bỏ qua để trải nghiệm nhanh.
  - Bảng thông số bất động sản (Diện tích đất, Diện tích sàn, Hướng nhà, Số phòng ngủ, Giá bán dự kiến).

---

## 3. CƠ CHẾ TRAO ĐỔI DỮ LIỆU & SỰ KIỆN

Hệ thống sử dụng mô hình **Event-Driven Pub/Sub** nhẹ để đồng bộ giữa 3D Scene và Giao diện HTML:
```typescript
interface AppEvents {
  'camera:state-changed': (state: CameraState) => void;
  'camera:progress': (progress: number) => void;
  'property:room-selected': (roomId: string) => void;
  'material:changed': (category: string, materialId: string) => void;
  'view:mode-changed': (mode: ViewMode) => void;
  'auth:open': () => void;
  'auth:close': () => void;
}
```

---

## 4. KẾT LUẬN KIẾN TRÚC

Kiến trúc trên thỏa mãn 100% các yêu cầu:
1. Trải nghiệm mở màn cuốn hút, chuyển đổi mượt từ ngoài vào trong nhà qua con lăn chuột.
2. Không bị ràng buộc cứng với 1 căn nhà duy nhất; có thể nạp các bộ dữ liệu khác nhau.
3. Không làm ảnh hưởng tính năng đăng nhập; UI và 3D hòa quyện thẩm mỹ cao cấp.
4. Hiệu năng ổn định, an toàn bộ nhớ GPU.
