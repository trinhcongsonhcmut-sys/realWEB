# TÀI LIỆU THIẾT KẾ MÁY TRẠNG THÁI CAMERA & FIXED PATH WALKTHROUGH
**Tài liệu:** `docs/architecture/CAMERA_STATE_MACHINE.md`  
**Phiên bản:** 2.0 (Scroll-Driven Fixed Path Walkthrough Architecture)  
**Ngày cập nhật:** 24/10/2026  

---

## 1. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

Áp dụng chuẩn kiến trúc Web 3D cao cấp:
**Fixed Camera Path + Scroll-driven Animation + Interior Look Around Controller**.

- **Giai đoạn ngoại thất vào nhà:** 
  - Không sử dụng orbit tự do hoặc kéo chuột tìm hướng.
  - Người dùng chỉ cần cuộn chuột (hoặc vuốt), camera di chuyển dọc theo tuyến đường cố định gồm 6 Waypoint đã được căn chỉnh chính xác theo hình học của ngôi nhà.
  - Lăn tới $\rightarrow$ tiến vào nhà; lăn ngược $\rightarrow$ lùi ra đúng theo đường cũ.
  - Không cho phép camera tự do bay lệch hướng hay xuyên tường.
- **Giai đoạn nội thất:**
  - Khi tiến trình đạt 100% (Waypoint 6 trong phòng khách), camera dừng tại vị trí thiết kế.
  - Kích hoạt chế độ `INTERIOR_LOOK_AROUND`: Người dùng kéo chuột xoay 360° tự do quan sát trần, sàn, tường và nội thất.

---

## 2. THIẾT KẾ 6 WAYPOINT CHUẨN XÁC THEO HÌNH HỌC NGÔI NHÀ

| Waypoint | Tọa độ Camera (Position) | Tọa độ Ngắm (Target) | Tiến trình ($p$) | Mô tả hành vi & tương tác kiến trúc |
| :--- | :--- | :--- | :--- | :--- |
| **Waypoint 1** | `[12.0, 7.0, 16.0]` | `[0.0, 3.2, 0.0]` | `0.00` | Toàn cảnh kiến trúc ngoại thất 2 tầng, ban công kính và sân vườn. |
| **Waypoint 2** | `[1.2, 2.4, 7.5]` | `[0.2, 1.8, 1.4]` | `0.35` | Camera tiến gần mặt tiền, bắt đầu dẫn hướng vào lối đi dạo trước sảnh. |
| **Waypoint 3** | `[0.2, 1.65, 3.2]` | `[0.2, 1.65, 1.4]` | `0.65` | Camera định vị trước sảnh cửa chính ở tầm mắt thực tế (1.65m). Cánh cửa chính bắt đầu hé mở. |
| **Waypoint 4** | `[0.2, 1.65, 1.4]` | `[0.2, 1.65, -1.0]` | `0.82` | Cánh cửa mở rộng 75°. Camera căn chỉnh hướng nhìn thẳng và tiến xuyên qua cửa chính. |
| **Waypoint 5** | `[0.1, 1.65, 0.2]` | `[0.0, 1.55, -3.2]` | `0.92` | Camera vượt qua ngạch cửa, bước vào sảnh đón phòng khách. |
| **Waypoint 6** | `[0.0, 1.65, -2.2]` | `[0.0, 1.55, -4.8]` | `1.00` | Điểm dừng cố định trong phòng khách: tầm nhìn bao quát sofa, bàn trà, TV wall và quầy bar bếp. |

Đường đi được nội suy bằng **Centripetal Catmull-Rom Spline** (`THREE.CatmullRomCurve3`) với hệ số alpha `0.5`, triệt tiêu hoàn toàn hiện tượng võng lệch hay đâm xuyên tường.

---

## 3. CƠ CHẾ ĐIỀU KHIỂN & ĐỒNG BỘ CÁNH CỬA

- **Tiến trình chuẩn hóa ($p \in [0, 1]$):**
  - Quản lý qua `ScrollProgressController` với 2 biến: `targetProgress` và `currentProgress`.
  - Công thức Damping độc lập FPS:
    $$\Delta p = (p_{\text{target}} - p_{\text{current}}) \times \min(1.0, \Delta t \times 5.5)$$
- **Đồng bộ mở cửa chính:**
  - $p < 0.58$: Cửa đóng kín ($0^\circ$).
  - $0.58 \le p \le 0.80$: Cửa xoay mở từ $0^\circ \to -75^\circ$.
  - $p > 0.80$: Cửa mở hoàn toàn khi camera bước qua ngạch cửa.
  - Khi lăn ngược, cửa tự động khép lại mượt mà theo cùng tỷ lệ.

---

## 4. MÔ HÌNH MÁY TRẠNG THÁI (CAMERA STATE MACHINE)

```
       +---------------------------------------------+
       |            EXTERIOR_SCROLL_PATH             |
       |  - Chỉ cuộn chuột / vuốt theo đường dẫn cố định  |
       |  - Camera chạy theo Catmull-Rom Spline     |
       +----------------------+----------------------+
                              |
                     (p đạt 1.0 vào nhà)
                              v
       +---------------------------------------------+
+----> |            INTERIOR_LOOK_AROUND             | <----+
|      |  - Khóa vị trí tại Waypoint 6                |      |
|      |  - Kéo chuột xoay 360° quan sát nội thất     |      |
|      +----------------------+----------------------+      |
|                             |                             |
|        (Lăn ngược lại hoặc nhấp "Toàn cảnh")              |
|                             v                             |
|      +---------------------------------------------+      |
|      |            RETURNING_TO_EXTERIOR            |      |
|      |  - Lướt mượt mà trở lại Waypoint 1 ngoài sân|      |
|      +---------------------------------------------+      |
|                                                           |
| (Hotspot chọn phòng)                      (Chế độ Dollhouse/Floorplan)
+-----------------------------------------------------------+
```

---

## 5. CẤU TRÚC CODE THEO NGUYÊN TẮC MODULAR DECOUPLING

- **`src/config/houseNavigationConfig.ts`**: Cấu hình 6 Waypoints, thời điểm mở cửa, độ nhạy và giới hạn góc quay. Dễ dàng đổi sang căn nhà khác bằng cách nạp config JSON/TS mới.
- **`src/camera/ScrollProgressController.ts`**: Chuẩn hóa tín hiệu con lăn chuột và vuốt cảm ứng đa thiết bị.
- **`src/camera/CameraPathController.ts`**: Toán học đường cong Catmull-Rom spline và tính toán vị trí theo tiến trình.
- **`src/camera/InteriorLookController.ts`**: Xoay nhìn 360° góc phòng khách với ma sát quán tính mượt mà.
- **`src/camera/CameraStateMachine.ts`**: Điều phối vòng đời trạng thái camera và chuyển quyền điều khiển.
