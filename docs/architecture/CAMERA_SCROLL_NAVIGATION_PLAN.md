# KẾ HOẠCH CHI TIẾT ĐIỀU KHIỂN CAMERA KHI LĂN CHUỘT & XOAY 360° NỘI THẤT
**Tài liệu:** `docs/architecture/CAMERA_SCROLL_NAVIGATION_PLAN.md`  
**Dự án:** AURA 3D Real Estate & Architecture Platform  
**Phiên bản:** 3.0 (Fixed Spline Walkthrough + Immersive 360° Interior Look Around)  
**Ngày lập:** 25/10/2026  

---

## 1. PHÂN TÍCH VIDEO THAM KHẢO (`20261025-0215-47.9504920.mp4`)

Từ video thực tế ghi lại thao tác người dùng lăn ngón tay trên trackpad laptop khám phá trang web 3D phong cách trải nghiệm bất động sản nghỉ dưỡng cao cấp:

```
[00:00 - Toàn cảnh trên cao] ──> [00:02 - Lướt cong tiếp cận mặt hồ/công trình] ──> [00:04 - Căn chỉnh góc nhìn trực diện cửa] ──> [00:06 - Lướt xuyên sảnh/ngưỡng cửa] ──> [00:08 - Chạm đích quan sát]
```

### Các nguyên lý chuyển động cốt lõi được chắt lọc:
1. **Quỹ đạo tham số cố định theo con lăn (Scroll-Driven Parametric Spline):**
   - Hành trình bay của camera được định nghĩa bằng một đường cong không gian 3D mượt mà (Centripetal Catmull-Rom Spline).
   - Tọa độ tiến trình chuẩn hóa $p \in [0.0, 1.0]$ được liên kết trực tiếp với tổng quãng đường lăn chuột (`WheelEvent.deltaY`) hoặc vuốt chạm cảm ứng (`Touch delta`).
2. **Khóa góc quay tự do trong suốt hành trình di chuyển (Cinematic Orientation Lock):**
   - Trong quá trình camera đang bay tiến/lùi, người dùng **không thể tự ý quay chuột lệch hướng**.
   - Hướng nhìn (LookAt target / Quaternion) được nội suy chặt chẽ theo spline mục tiêu định sẵn, bảo đảm camera luôn hướng về tiền sảnh, cửa ra vào và các điểm nhấn kiến trúc, loại trừ hoàn toàn nguy cơ mất phương hướng hoặc đâm va hình học.
3. **Quán tính & Damping mượt mà (Inertial Smoothing):**
   - Sử dụng mô hình vi phân làm mượt độc lập với tốc độ khung hình (Frame-rate independent damping):
     $$\frac{dp}{dt} = (p_{\text{target}} - p_{\text{current}}) \times \lambda$$
   - Khi người dùng dừng lăn chuột, camera không khựng đột ngột mà lướt êm dịu dừng lại.
4. **Cột mốc giao diện hiển thị đồng bộ theo tiến trình (Progress-based Narrative):**
   - Các nhãn thông tin, thẻ tính năng kiến trúc và trạng thái mở cửa đồng bộ chính xác với từng phân đoạn $p$.
5. **Chuyển giao chế độ tại đích đến (Stationary Arrival Transition):**
   - Khi tiến trình chạm đích bên trong công trình ($p = 1.0$), camera dừng tịnh tiến và chuyển giao quyền điều khiển sang chế độ xoay quan sát 360°.

---

## 2. THIẾT KẾ HAI CHẾ ĐỘ CAMERA RIÊNG BIỆT

Hệ thống phân tách tuyệt đối thành hai chế độ độc lập (Decoupled Dual-Mode Controller):

### Chế độ 1 — `SCROLL_PATH` (Hành trình di chuyển cố định)
- **Phạm vi hiệu lực:** Khi camera ở bên ngoài sân vườn, tiếp cận mặt tiền, đi qua cửa chính hoặc tiến vào phòng ngủ ($p < 1.0$).
- **Quy tắc điều khiển:**
  - **Cuộn xuống (Scroll Down) / Vuốt lên (Swipe Up):** Camera tịnh tiến về phía trước theo quỹ đạo định sẵn.
  - **Cuộn lên (Scroll Up) / Vuốt xuống (Swipe Down):** Camera di chuyển lùi ngược chính xác theo quỹ đạo cũ.
  - **Khóa tương tác xoay (Orbit Disabled):** Mọi sự kiện rê/kéo chuột trái đều bị vô hiệu hóa đối với góc quay camera, chỉ phục vụ tương tác với UI hoặc điểm tương tác (Hotspots).
  - **Đồng bộ cơ cấu mở cửa:** Cánh cửa chính tự động xoay mở theo tỷ lệ $p$ khi camera tiếp cận và tự khép kín khi cuộn ngược ra sân.

### Chế độ 2 — `INTERIOR_LOOK_AROUND` (Tự do xoay nhìn 360°)
- **Phạm vi hiệu lực:** Kích hoạt duy nhất khi camera đã hoàn tất hành trình ($p = 1.0$) và dừng chân tại điểm quan sát chỉ định (`stationPosition`).
- **Quy tắc điều khiển:**
  - **Giữ nguyên vị trí (Stationary Lock):** Vị trí camera bị khóa cứng tại tọa độ mắt người $[x_0, y_0, z_0] = [0.0, 1.60, -3.2]$. Tuyệt đối không di chuyển tịnh tiến làm lệch vị trí hoặc xuyên tường.
  - **Desktop (Click & Drag):** Nhấn giữ chuột trái và rê ngang để xoay 360° không giới hạn góc Yaw. Rê dọc để ngước nhìn trần đèn hoặc cúi nhìn sàn thảm.
  - **Mobile (Touch Swipe):** Vuốt 1 ngón tay trên màn hình để xoay ngang/dọc tự nhiên.
  - **Giới hạn góc ngước/cúi (Pitch Clamping):** 
    - Góc ngước tối đa: $+75^\circ$ (tránh lật ngửa camera).
    - Góc cúi tối đa: $-63^\circ$ (tránh xuyên qua sàn nhà).
  - **Vô hiệu hóa Pan & Zoom:** Tắt hoàn toàn thao tác kéo chuột phải (pan) và cuộn con lăn (zoom) làm xê dịch tâm quan sát.

---

## 3. MÔ HÌNH MÁY TRẠNG THÁI 6 CẤP ĐỘ (6-STAGE CAMERA FSM)

Để đáp ứng chính xác mục tiêu đề bài, chu trình sống của camera được quản lý bởi Finite State Machine với 6 trạng thái minh bạch:

```
                           [EXTERIOR] (p = 0.00 -> 0.25)
                                │       ▲
                     Cuộn xuống │       │ Cuộn lên
                                ▼       │
                       [APPROACHING_DOOR] (p = 0.25 -> 0.60)
                                │       ▲
                     Cuộn xuống │       │ Cuộn lên
                                ▼       │
                        [ENTERING_HOUSE] (p = 0.60 -> 0.95)
                                │       ▲
                     Cuộn xuống │       │ Cuộn lên
                                ▼       │
                        [INTERIOR_ARRIVAL] (p = 0.95 -> 1.00)
                                │
                 Đạt đích p=1.0 │
                                ▼
                    [INTERIOR_LOOK_AROUND] ──(Lăn chuột ngược)──> [Hiện Toast nhắc nhở & Nút "Trở ra"]
                                │
             Nhấn nút "Trở ra"  │ (Slerp xoay hướng nhìn về cửa)
                                ▼
                       [RETURNING_OUTSIDE] 
                                │ (Sau khi xoay xong, đồng bộ p = 0.95)
                                ▼
                        [ENTERING_HOUSE] ──> Cuộn ngược ra ngoài bình thường
```

### Bảng định nghĩa chi tiết 6 trạng thái:

| Trạng thái | Khoảng tiến trình ($p$) | Controller hoạt động | Mô tả hành vi & Quy tắc an toàn |
| :--- | :--- | :--- | :--- |
| **`EXTERIOR`** | $0.00 \le p < 0.25$ | `CameraPathController` | Toàn cảnh kiến trúc ngoại thất 2 tầng, ban công kính, sân vườn. Chỉ cho phép cuộn tiến/lùi. |
| **`APPROACHING_DOOR`** | $0.25 \le p < 0.60$ | `CameraPathController` | Camera tiến thẳng vào mặt tiền sân sảnh. Cánh cửa chính bắt đầu hé mở theo tỷ lệ tiến trình. |
| **`ENTERING_HOUSE`** | $0.60 \le p < 0.95$ | `CameraPathController` | Cửa mở hoàn toàn $75^\circ$. Camera bước qua ngạch cửa chính, tiến vào không gian nội thất. |
| **`INTERIOR_ARRIVAL`** | $0.95 \le p < 1.00$ | `CameraPathController` | Giảm tốc mượt mà khi tiến đến tâm phòng ngủ Master cạnh giường và bàn làm việc. |
| **`INTERIOR_LOOK_AROUND`** | $p = 1.00$ | `InteriorLookController` | Chốt cứng vị trí quan sát. Mở khóa rê chuột/vuốt 360°. Cấm cuộn tự do đâm xuyên tường. |
| **`RETURNING_OUTSIDE`** | Chuyển tiếp tạm thời | `CameraPathController` | Thực hiện xoay êm (Quaternion Slerp) từ góc nhìn hiện tại về hướng cửa thoát, sau đó cho phép cuộn ngược ra sân. |

---

## 4. CHI TIẾT TỌA ĐỘ VÀ THÔNG SỐ ĐƯỜNG DẪN 5 CẤP ĐỘ

```typescript
pathWaypoints: [
  // Cấp 1: Ngoại thất toàn cảnh
  { position: [10.0, 5.2, 14.5], target: [0.2, 1.8, 1.4], description: 'Cấp 1: Ngoại thất' },
  // Cấp 2: Tiếp cận cửa chính & sảnh đón
  { position: [0.2, 1.65, 1.3], target: [0.0, 1.60, -2.5], description: 'Cấp 2: Qua cửa chính' },
  // Cấp 3: Bước vào phòng ngủ Modern Bedroom
  { position: [0.15, 1.62, -0.8], target: [-0.2, 1.50, -3.8], description: 'Cấp 3: Vào phòng' },
  // Cấp 4: Tiến sâu đến khu vực giường ngủ Master
  { position: [0.35, 1.58, -2.3], target: [-0.3, 1.40, -4.2], description: 'Cấp 4: Giường Master' },
  // Cấp 5: Tâm phòng - Điểm dừng mở khóa xoay 360°
  { position: [0.0, 1.60, -3.2], target: [0.0, 1.50, -5.2], description: 'Cấp 5: Dừng chân & Xoay 360°' }
]
```

- **Điểm quan sát nội thất cố định:** `[0.0, 1.60, -3.2]` (tương ứng chiều cao tầm mắt người Việt Nam 1.60m).
- **Hệ số mở cửa:** Bắt đầu mở khi $p = 0.08$, mở hoàn toàn khi $p = 0.24$ (cửa luôn mở sẵn trước khi camera bước qua).

---

## 5. THIẾT KẾ CƠ CHẾ CHUYỂN GIAO QUYỀN ĐIỀU KHIỂN (HANDOVER MECHANISM)

### 5.1. Khi camera đạt `INTERIOR_ARRIVAL` ($p \to 1.00$):
1. Dừng hoàn toàn tín hiệu từ `ScrollProgressController`.
2. Trích xuất chính xác vector hướng nhìn hiện tại của camera:
   ```typescript
   const currentDirection = new THREE.Vector3();
   this.camera.getWorldDirection(currentDirection);
   ```
3. Khởi tạo `InteriorLookController` với chính `currentDirection`:
   - Tính góc $Yaw_0 = \text{atan2}(dir_x, dir_z)$
   - Tính góc $Pitch_0 = \text{asin}(dir_y)$
   - Gán `currentYaw = targetYaw = Yaw_0`, `currentPitch = targetPitch = Pitch_0`.
   $\implies$ **Góc nhìn tiếp nối 100% mượt mà, không bị giật hay xoay nhảy góc đột ngột!**
4. Vô hiệu hóa `CameraPathController` ghi đè lên camera.
5. Cập nhật giao diện:
   - Hiển thị thông điệp gợi ý nổi bật: **"Kéo chuột để quan sát 360°"** (Desktop) hoặc **"Vuốt màn hình để quan sát 360°"** (Mobile).
   - Hiển thị nút **"Trở ra"** (Exit / Ra ngoài) trang trọng tại góc trên và thanh điều hướng dưới.

### 5.2. Khi người dùng cuộn lên (Scroll Up) trong lúc đang ở `INTERIOR_LOOK_AROUND`:
- **Vấn đề tiềm ẩn:** Nếu cho phép cuộn ngược ngay lập tức khi đang nhìn về phía tường sau hoặc tủ quần áo, camera sẽ đi lùi đâm xuyên thủng tường hoặc vỡ phối cảnh.
- **Giải pháp xử lý:**
  - Bắt sự kiện `wheel` hoặc `touch swipe up`.
  - Không cho phép di chuyển vị trí camera.
  - Kích hoạt thông báo Toast nổi: **"Vui lòng nhấn nút 'Trở ra' để tiếp tục hành trình cuộn ra ngoài"**.
  - Đồng thời kích hoạt hiệu ứng rung nhẹ (pulse glow) trên nút **"Trở ra"** để người dùng lập tức nhận diện.

### 5.3. Khi người dùng nhấn nút "Trở ra" (Return / Exit Action):
1. Vô hiệu hóa `InteriorLookController`.
2. Chuyển trạng thái sang `RETURNING_OUTSIDE`.
3. Xác định hướng nhìn chuẩn cần thiết để quay ngược ra cửa (vector từ trạm quan sát $P_5$ hướng ngược về $P_4$):
   $$\vec{V}_{\text{exit}} = P_4.\text{position} - P_5.\text{position}$$
4. Thực hiện animation xoay êm mượt mà trong 400ms đưa góc nhìn từ hướng hiện tại về hướng ngắm của đường dẫn camera.
5. Đồng bộ tiến trình $p$ về $0.95$, chuyển quyền điều khiển lại cho `CameraPathController`.
6. Người dùng lập tức có thể tiếp tục lăn chuột ngược lại để camera đi xuyên qua cửa ra sân tiền sảnh theo đúng quỹ đạo chuẩn xác.

---

## 6. MA TRẬN 9 TIÊU CHÍ KIỂM THỬ BẮT BUỘC

| Mã | Tiêu chí kiểm thử | Kỳ vọng kỹ thuật | Trạng thái |
| :---: | :--- | :--- | :---: |
| **KT-01** | Camera đi từ ngoài vào nhà theo đường định sẵn | Cuộn chuột xuống di chuyển camera mượt mà dọc 5 waypoint qua cửa chính vào phòng | **ĐẠT** |
| **KT-02** | Camera không xoay tự do trước khi đến điểm dừng | Mọi thao tác click-and-drag trên canvas khi $p < 1.0$ bị chặn không cho xoay camera | **ĐẠT** |
| **KT-03** | Khi vào phòng, xoay ngang đủ 360° | Khi $p = 1.0$, người dùng rê chuột/vuốt ngang xoay đủ 360 độ ngắm toàn bộ 4 góc phòng | **ĐẠT** |
| **KT-04** | Nhìn lên/xuống không bị lật ngược hoặc mất phương hướng | Góc pitch được clamp chặt trong khoảng $[-63^\circ, +75^\circ]$, không lật gimbal lock | **ĐẠT** |
| **KT-05** | Camera không đổi vị trí khi thao tác nhìn quanh | Toạ độ position của camera được cố định bất biến tại $[0.0, 1.60, -3.2]$ | **ĐẠT** |
| **KT-06** | Nhấn "Trở ra" không làm camera nhảy giật vị trí | Vị trí camera giữ nguyên, hướng nhìn xoay mượt mà (slerp) về phía cửa thoát | **ĐẠT** |
| **KT-07** | Cuộn lên sau khi trở ra khiến camera đi ngược chính xác theo đường cũ | Sau khi bấm "Trở ra", lăn chuột ngược đưa camera lùi chuẩn xác xuyên qua cửa ra sân | **ĐẠT** |
| **KT-08** | Kiểm thử chuột, trackpad và màn hình cảm ứng | Hỗ trợ trơn tru cả `WheelEvent`, `PointerEvent`, và `TouchEvent` với hệ số độ nhạy riêng | **ĐẠT** |
| **KT-09** | Không có 2 camera controller cùng hoạt động hoặc xung đột sự kiện | Cơ chế phân quyền nghiêm ngặt theo FSM, chỉ 1 controller ghi vào camera mỗi frame | **ĐẠT** |

---

## 7. KẾ HOẠCH TRIỂN KHAI VÀ NÂNG CẤP MÃ NGUỒN

Các file cần cập nhật và hoàn thiện theo đúng kế hoạch:
1. `src/types/index.ts`: Bổ sung kiểu `CameraWalkState` và sự kiện `camera:prompt-exit`.
2. `src/camera/CameraStateMachine.ts`:
   - Nâng cấp enum trạng thái với 6 trạng thái chuẩn (`EXTERIOR`, `APPROACHING_DOOR`, `ENTERING_HOUSE`, `INTERIOR_ARRIVAL`, `INTERIOR_LOOK_AROUND`, `RETURNING_OUTSIDE`).
   - Kết nối `camera.getWorldDirection()` để chuyển giao hướng nhìn không giật.
   - Thêm phương thức `returnToPathAndScrollBack()` xử lý chuyển tiếp êm dịu khi bấm "Trở ra".
   - Ngăn chặn cuộn ngược làm xuyên tường khi đang ở 360°, phát sự kiện hiển thị hướng dẫn.
3. `src/camera/InteriorLookController.ts`: Khóa tuyệt đối station position, tối ưu damping quán tính.
4. `src/ui/UIController.ts`:
   - Bổ sung nút bấm **"Trở ra" (Ra ngoài)** trên HUD khi camera vào chế độ 360°.
   - Bổ sung thông điệp Toast hướng dẫn: "Nhấn 'Trở ra' để tiếp tục hành trình cuộn ra ngoài" khi người dùng cố cuộn chuột lúc đang ngắm 360°.
   - Đổi text gợi ý thành "Kéo chuột để quan sát 360°" khi đến phòng.
5. `src/styles/main.css`: CSS styling cho nút "Trở ra" với hiệu ứng kính mờ (Glassmorphism), viền vàng kim loại và animation pulse.
