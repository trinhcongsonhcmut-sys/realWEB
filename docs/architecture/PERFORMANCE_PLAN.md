# KẾ HOẠCH TỐI ƯU HIỆU NĂNG & TƯƠNG THÍCH ĐA THIẾT BỊ (PERFORMANCE PLAN)
**Tài liệu:** `docs/architecture/PERFORMANCE_PLAN.md`  
**Chuyên mục:** Quản lý tài nguyên GPU, VRAM, tốc độ khung hình và trải nghiệm mượt mà  

---

## 1. CHIẾN LƯỢC TỐI ƯU HÓA HIỆU NĂNG RENDER

1. **Giới hạn Pixel Ratio (`devicePixelRatio`):**
   - Các dòng điện thoại cao cấp (iPhone, flagship Android) có màn hình Retina/OLED với pixel ratio lên tới `3.0` hoặc `4.0`. Việc render 3D ở độ phân giải 4K trên điện thoại sẽ làm nóng máy và tụt FPS nghiêm trọng.
   - Giải pháp: Khóa cứng `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0))`. Vừa đảm bảo hình ảnh sắc nét tuyệt đối, vừa giảm 50% khối lượng tính toán đổ bóng trên GPU.

2. **Tối ưu hóa Draw Calls & Geometry Sharing:**
   - Sử dụng chung Geometry và Material cho các vật thể cùng loại (tay vịn lan can, đèn âm trần, khung cửa kính, gờ chỉ tường).
   - Bật tính năng `mesh.matrixAutoUpdate = false` đối với các thành phần tĩnh sau khi đã đặt vị trí ban đầu và gọi `mesh.updateMatrix()`.

3. **Chiến lược Shadow Mapping:**
   - Chỉ một nguồn sáng duy nhất (`sunLight`) tạo bóng đổ thực tế bằng Shadow Map (`castShadow = true`).
   - Các đèn nội thất phụ sử dụng ánh sáng trực tiếp không sinh bóng đổ tính toán nặng (chỉ chiếu sáng bề mặt `receiveShadow = true`), giúp giữ Draw Calls ở mức tối ưu < 80 calls cho toàn bộ cảnh.
   - Thiết lập kích thước bản đồ bóng `2048x2048` với thuật toán lọc bóng mềm `THREE.PCFSoftShadowMap`.

4. **Quản lý rò rỉ bộ nhớ GPU (Memory Disposal Pattern):**
   - Khi chuyển đổi giữa các căn nhà hoặc khi component bị hủy, toàn bộ tài nguyên WebGL phải được thu hồi triệt để:
     ```typescript
     function disposeHierarchy(node: THREE.Object3D) {
       node.traverse((child) => {
         if ((child as THREE.Mesh).isMesh) {
           const mesh = child as THREE.Mesh;
           mesh.geometry?.dispose();
           if (Array.isArray(mesh.material)) {
             mesh.material.forEach((mat) => mat.dispose());
           } else if (mesh.material) {
             mesh.material.dispose();
           }
         }
       });
     }
     ```

5. **Tạm dừng Render khi người dùng không tương tác / Tab ẩn (Page Visibility API):**
   - Lắng nghe sự kiện `visibilitychange` của trình duyệt: Tự động tạm dừng vòng lặp `requestAnimationFrame` khi người dùng chuyển sang tab khác, giúp tiết kiệm 100% pin và tài nguyên CPU/GPU.

---

## 2. CHỈ TIÊU HIỆU NĂNG MỤC TIÊU (PERFORMANCE BUDGETS)

| Chỉ số | Máy tính để bàn (Desktop / Laptop) | Điện thoại & Máy tính bảng (Mobile / Tablet) |
| :--- | :--- | :--- |
| **Tốc độ khung hình (FPS)** | 55 - 60 FPS ổn định | 45 - 60 FPS ổn định |
| **Thời gian tải ban đầu (FCP)** | < 1.2 giây | < 1.8 giây |
| **Tiêu thụ bộ nhớ GPU (VRAM)** | < 180 MB | < 100 MB |
| **Số lượng Draw Calls** | 40 - 75 calls | 40 - 75 calls |
| **Tổng số đa giác (Triangles)** | 50,000 - 120,000 | 50,000 - 120,000 |

---

## 3. THỬ NGHIỆM TRÊN CÁC TRÌNH DUYỆT VÀ MÔI TRƯỜNG

Hệ thống được thiết kế để tương thích 100% với:
- Google Chrome (Desktop & Android)
- Apple Safari (macOS & iOS WebKit)
- Mozilla Firefox
- Microsoft Edge
- Màn hình cảm ứng: Cử chỉ vuốt để xoay, nhúm hai ngón để zoom, chạm nhẹ vào điểm Hotspot để di chuyển.
