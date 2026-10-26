# BÁO CÁO ĐÁNH GIÁ CÁC KHO MÃ NGUỒN MỞ GITHUB (REPOSITORY EVALUATION)
**Tài liệu:** `docs/research/REPOSITORY_EVALUATION.md`  
**Ngày kiểm tra & xác thực:** 24/10/2026  
**Chuyên gia thực hiện:** Senior Web 3D Architect  

---

## 1. DANH SÁCH CÁC REPOSITORY ĐÃ KHẢO SÁT VÀ XÁC MINH

Dưới đây là các kho lưu trữ mã nguồn mở uy tín trên GitHub được khảo sát và đánh giá nghiêm ngặt về tính năng, giấy phép, công nghệ có thể kế thừa và rủi ro tích hợp.

---

### REPO 1: `mrdoob/three.js`
- **URL chính thức:** [https://github.com/mrdoob/three.js](https://github.com/mrdoob/three.js)
- **Mục đích:** Thư viện đồ họa 3D WebGL/WebGPU tiêu chuẩn công nghiệp chạy trên trình duyệt.
- **Ngôn ngữ / Stack:** JavaScript (ES Modules).
- **Giấy phép (License):** MIT License (Cho phép tự do thương mại hóa, sửa đổi và phân phối).
- **Trạng thái & Cộng đồng:** Cực kỳ tích cực, hơn 100k Stars, cập nhật hàng tháng (r160 - r170+).
- **Kỹ thuật có thể kế thừa:**
  - `THREE.PerspectiveCamera`, `THREE.Scene`, `THREE.WebGLRenderer`.
  - Hệ thống vật liệu PBR cao cấp: `THREE.MeshStandardMaterial`, `THREE.MeshPhysicalMaterial` (độ nhám roughness, kim loại metalness, độ bóng trong suốt transmission).
  - Trình nạp tiêu chuẩn `GLTFLoader`, `DRACOLoader` và `KTX2Loader`.
  - Quản lý ánh sáng và bóng: `DirectionalLight`, `PCFSoftShadowMap`, `ACESFilmicToneMapping`.
- **Hạn chế / Rủi ro:**
  - Là thư viện cấp thấp, không có sẵn state machine cho bất động sản; nếu không kiến trúc chặt chẽ sẽ dễ dẫn tới mã nguồn lộn xộn.
- **Đánh giá tích hợp:** **Lõi nền tảng bắt buộc của hệ thống.**

---

### REPO 2: `yomotsu/camera-controls`
- **URL chính thức:** [https://github.com/yomotsu/camera-controls](https://github.com/yomotsu/camera-controls)
- **Mục đích:** Hệ thống điều khiển camera chuyên dụng cho Three.js, hỗ trợ chuyển động mượt, giới hạn góc, dolly, truck, fit to bounding box.
- **Ngôn ngữ / Stack:** TypeScript.
- **Giấy phép (License):** MIT License (An toàn tuyệt đối cho thương mại).
- **Trạng thái & Cộng đồng:** Rất tích cực, hơn 2.5k Stars, được tin dùng trong các dự án ArchViz và GIS.
- **Kỹ thuật có thể kế thừa:**
  - Phương thức `setLookAt(cx, cy, cz, tx, ty, tz, enableTransition)` cho phép dịch chuyển camera từ ngoài vào sảnh chính với gia tốc mượt mà.
  - Phân bổ mượt chuột và cảm ứng chạm (Touch / Gesture) trên mobile.
  - Hỗ trợ cản va chạm va đập (boundary collision test) và damping quán tính tự nhiên.
- **Hạn chế / Rủi ro:** Cần đồng bộ trạng thái chặt chẽ với sự kiện cuộn chuột tùy biến (Custom Wheel Scroll Engine) để tránh xung đột quyền điều khiển.
- **Đánh giá tích hợp:** **Kế thừa kỹ thuật toán học nội suy góc nhìn và điều khiển tương tác.**

---

### REPO 3: `gkjohnson/three-mesh-bvh`
- **URL chính thức:** [https://github.com/gkjohnson/three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh)
- **Mục đích:** Cấu trúc Bounding Volume Hierarchy tốc độ cao cho Three.js, tăng tốc độ raycasting và kiểm tra va chạm lên 100x lần.
- **Ngôn ngữ / Stack:** JavaScript / TypeScript.
- **Giấy phép (License):** MIT License.
- **Trạng thái & Cộng đồng:** Rất tích cực, hơn 3.2k Stars, được khuyên dùng chính thức trong cộng đồng Three.js.
- **Kỹ thuật có thể kế thừa:**
  - Spherecast và Capsule Collision giúp camera trong nhà di chuyển tự nhiên mà không bao giờ xuyên qua tường hoặc đồ vật nội thất.
  - Tối ưu hóa raycasting khi người dùng click vào các điểm tương tác (Hotspots) trong căn phòng có hàng chục nghìn đa giác.
- **Hạn chế / Rủi ro:** Tốn một lượng nhỏ RAM để tạo cây BVH ban đầu; đối với các bức tường hình hộp đơn giản, có thể kết hợp thêm AABB/Raycast nhẹ để tối ưu tài nguyên trên thiết bị yếu.
- **Đánh giá tích hợp:** **Áp dụng nguyên lý Raycasting và Capsule Collision cho tính năng chống xuyên tường.**

---

### REPO 4: `ch-bas/threejs-sims-house-builder`
- **URL chính thức:** [https://github.com/ch-bas/threejs-sims-house-builder](https://github.com/ch-bas/threejs-sims-house-builder)
- **Mục đích:** Ứng dụng dựng nhà 3D đa tầng trên trình duyệt với chế độ Walkthrough và thiết lập vật liệu chân thực.
- **Ngôn ngữ / Stack:** Next.js, Three.js, TypeScript.
- **Giấy phép (License):** MIT License.
- **Kỹ thuật có thể kế thừa:**
  - Phương pháp chia tầng (multi-floor architecture): phân tách Tầng trệt (Ground Floor), Lầu 1 (First Floor), và Mái (Roof).
  - Kỹ thuật cắt lớp Dollhouse và hiển thị mặt bằng Floor Plan bằng cách ẩn trần nhà và điều chỉnh mặt cắt clipping plane.
  - Pipeline ánh sáng PCF shadows và ACES tone mapping cho công trình nhà ở.
- **Hạn chế / Rủi ro:** Dự án tập trung vào tính năng vẽ tường kéo thả (CAD-like) hơn là trải nghiệm landing page bất động sản cao cấp và chuyển tiếp camera tinh tế qua cửa ra vào.
- **Đánh giá tích hợp:** **Kế thừa cấu trúc phân tầng dữ liệu nhà ở và phương pháp hiển thị Dollhouse/Floorplan.**

---

### REPO 5: `tweenjs/tween.js` & GSAP Core
- **URL chính thức:** [https://github.com/tweenjs/tween.js](https://github.com/tweenjs/tween.js) / [https://github.com/greensock/GSAP](https://github.com/greensock/GSAP)
- **Mục đích:** Thư viện nội suy thời gian thực (Tweening / Easing) cho các chuyển động camera và giao diện.
- **Giấy phép (License):** tween.js (MIT) / GSAP (Standard license với điều khoản thương mại đặc thù).
- **Kỹ thuật có thể kế thừa:**
  - Các hàm toán học Easing: `Quadratic.InOut`, `Cubic.Out`, `Sinusoidal.InOut`.
  - Cơ chế nội suy Bezier / Catmull-Rom Curve cho đường cong camera tiến qua cửa.
- **Đánh giá tích hợp:** **Sử dụng tween.js hoặc Easing Math thuần để đảm bảo 100% mã nguồn mở tự do, nhẹ và không vướng rắc rối bản quyền.**

---

## 2. BẢNG TỔNG HỢP SO SÁNH GIÁ TRỊ TÁI SỬ DỤNG VÀ GIẢI PHÁP TÍCH HỢP

| Thành phần hệ thống | Công nghệ / Nguồn kế thừa | Cơ chế triển khai thực tế |
| :--- | :--- | :--- |
| **Core 3D Engine** | Three.js Core (r170+) | Tích hợp trực tiếp vào Module `RealEstateViewer` |
| **Camera State Machine** | Tự thiết kế theo mẫu hướng trạng thái FSM kết hợp nguyên lý `camera-controls` | Quản lý chuyển đổi giữa 7 trạng thái camera rõ ràng |
| **Đường dẫn camera xuyên cửa** | `THREE.CatmullRomCurve3` + Spline Interpolation | Ánh xạ tiến độ cuộn chuột `scrollProgress` (0.0 -> 1.0) |
| **Chống xuyên tường** | Bounding Box AABB + Capsule Clamping | Giới hạn camera trong tọa độ an toàn của phòng |
| **Kiến trúc Nhà phố Mẫu** | Hybrid Architectural Shell + PBR Materials | Tạo mô hình nhà phố 2 tầng hiện đại, ban công kính, phòng khách nội thất đầy đủ |
| **Giao diện Đăng nhập** | Vanilla CSS Glassmorphism + Modern UI | Không chặn 3D; tương tác song song |

---

## 3. KẾT LUẬN ĐÁNH GIÁ

Toàn bộ các giải pháp được lựa chọn đều sử dụng giấy phép **MIT License**, đảm bảo tính an toàn thương mại, không bị ràng buộc bản quyền đóng gói, đồng thời cho phép tối ưu hiệu năng tối đa trên trình duyệt web.
Mã nguồn sẽ được xây dựng theo kiến trúc mô-đun hóa cao cấp, sạch sẽ và sẵn sàng mở rộng sang nhiều căn nhà trong giai đoạn phát triển tiếp theo.
