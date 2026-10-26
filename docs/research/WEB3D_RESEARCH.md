# BÁO CÁO NGHIÊN CỨU TOÀN DIỆN CÔNG NGHỆ WEB 3D CHO BẤT ĐỘNG SẢN & KIẾN TRÚC NỘI THẤT
**Tài liệu:** `docs/research/WEB3D_RESEARCH.md`  
**Ngày nghiên cứu & kiểm chứng:** 24/10/2026  
**Chuyên môn:** AI Research Engineer + Senior Web 3D Architect + Full-Stack Developer  

---

## 1. TỔNG QUAN VÀ MỤC TIÊU NGHIÊN CỨU

Nghiên cứu này phục vụ việc xây dựng nền tảng **Web 3D Bất Động Sản** cao cấp chuyên biệt cho **nhà phố, nhà ở thương mại và kiến trúc nội thất**.
Yêu cầu cốt lõi:
1. **Trải nghiệm khởi đầu đột phá:** Không dùng form đăng nhập che kín màn hình; khởi đầu bằng toàn cảnh 3D ngôi nhà phố ngoại thất, lăn chuột tiến sát mặt tiền và cửa chính, thực hiện camera animation chuyển tiếp xuyên qua cửa (portal transition) mượt mà vào nội thất.
2. **Khám phá nội thất đa chế độ:** 360° Orbit, First-Person walkthrough, Dollhouse (mô hình cắt lớp) và Floor Plan (mặt bằng 2D/3D).
3. **Kiến trúc phần mềm mở rộng:** Hệ thống quản lý nhiều bất động sản, cấu hình vật liệu (material customizer), điểm tương tác (hotspots), camera waypoints độc lập dữ liệu.
4. **Hiệu năng & Khả năng tương thích:** Tải nhanh, không giật lag, quản lý bộ nhớ WebGL/GPU chặt chẽ, tối ưu hóa cho Desktop, Tablet và Mobile.

---

## 2. BẢNG SO SÁNH VÀ ĐÁNH GIÁ CÁC CÔNG NGHỆ WEB 3D

| Tiêu chí | Three.js (Core + TS) | React Three Fiber (R3F) + Drei | Babylon.js | PlayCanvas | Pannellum / Marzipano (360 Tours) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bản chất kiến trúc** | Thư viện WebGL/WebGPU linh hoạt, phi ý kiến (unopinionated) | Declarative React Renderer bọc Three.js | Game/Archviz 3D Engine toàn diện (all-in-one) | WebGL Game Engine trên đám mây | Thư viện ảnh tĩnh 360 Panorama / Equirectangular |
| **Kích thước bundle** | Nhẹ (~150KB gzip Three.js core) | Trung bình (~220KB gzip gồm React + R3F) | Nặng (~1.2MB - 2MB gzip trọn gói) | Trung bình (phụ thuộc engine bundle) | Cực nhẹ (~30KB - 60KB gzip) |
| **Kiểm soát Camera & Vòng lặp Render** | Tối đa; trực tiếp can thiệp `requestAnimationFrame`, ma trận và easing | Tốt thông qua `useFrame`, tuy nhiên dễ rơi vào bẫy re-render nếu sai pattern | Tốt, có sẵn ArcRotateCamera, UniversalCamera | Tốt, hướng component script | Kém, chỉ xoay quanh 1 điểm chụp ảnh tĩnh |
| **Không gian 3D hình học thực (Geometry)** | Hỗ trợ 100% Mesh, GLB, BVH Collision | Hỗ trợ 100% Mesh, GLB, BVH | Hỗ trợ 100% Mesh, GLB, Havok Physics | Hỗ trợ 100% | **Không có hình học thực** (chỉ chiếu ảnh lên cầu) |
| **Chuyển tiếp Camera (Ngoại thất -> Cửa -> Nội thất)** | Cực kỳ mượt mà qua CatmullRomCurve3, GSAP/Lerp, CameraControls | Tốt qua `@react-three/drei` CameraControls / Spline | Tốt qua AnimationGroups | Tốt | Không thể thực hiện chuyển động xuyên cửa thực tế |
| **Khả năng tích hợp UI Đăng nhập & HUD** | Tuyệt đối sạch sẽ qua DOM/CSS Glassmorphism phân lớp không phụ thuộc | Rất thuận tiện qua React State | Có GUI Engine riêng nhưng phong cách Canvas cũ; kết hợp React cần wrapper | Tách biệt Canvas và DOM | DOM đơn giản |
| **Chống rò rỉ GPU (Memory Disposal)** | Rõ ràng, minh bạch thông qua `dispose()` pattern | Tự động khi unmount, nhưng dễ duplicate texture nếu state re-render | Tự động trong scene dispose | Quản lý theo scene | Tự giải phóng bộ nhớ ảnh |
| **Khả năng mở rộng Data-Driven (Multi-property)** | Xuất sắc: Kiến trúc Service/Controller tách biệt hoàn toàn UI | Tốt: Cần quản lý Context/Zustand kỹ | Tốt | Phù hợp editor của họ | Hạn chế |
| **Quyết định lựa chọn** | **ĐƯỢC CHỌN (Nền tảng chính)** | Xem xét bổ trợ cho component UI | Không chọn do bundle quá nặng cho web tải nhanh | Không chọn do phụ thuộc editor đám mây | Loại bỏ (không đáp ứng yêu cầu nhà 3D hình học) |

### Lý do lựa chọn Three.js (TypeScript + Vite) làm kiến trúc nền tảng:
1. **Kiểm soát tối đa hiệu năng render:** Trải nghiệm chuyển tiếp từ ngoài vào trong nhà thông qua cửa chính đòi hỏi điều khiển chính xác vị trí camera, góc nhìn (FOV), mục tiêu ngắm (Target), clipping planes (near/far) và kiểm tra va chạm tường theo từng milli-giây. Three.js cho phép can thiệp trực tiếp vòng lặp mà không có chi phí trừu tượng ảo của virtual DOM.
2. **Kích thước tải ban đầu siêu nhanh:** Người dùng bất động sản không muốn chờ 10-20 giây để tải một engine 5MB trước khi thấy màn hình đăng nhập. Three.js kết hợp Vite cho phép tải trang tức thì dưới 1.5 giây.
3. **Phân tách trách nhiệm hoàn hảo:** Module 3D (Scene, Engine, Camera State Machine) hoàn toàn độc lập với UI Layer (HTML5/Vanilla CSS Glassmorphism). Điều này cho phép giao diện Đăng nhập, thông tin giá nhà, chọn phòng có thể nâng cấp, thay đổi framework (từ Vanilla sang React/Next.js hoặc Vue) mà không làm hỏng logic đồ họa.

---

## 3. NGHIÊN CỨU BA PHƯƠNG PHÁP DỰNG NGÔI NHÀ 3D

### Phương pháp A: Dựng nhà thuần túy bằng Code (Procedural Geometry)
- **Cơ chế:** Dùng `THREE.BoxGeometry`, `THREE.ExtrudeGeometry`, `THREE.Shape`, kết hợp vật liệu chuẩn để sinh ra sàn, tường, cửa, mái, ban công.
- **Ưu điểm:** Không cần tải file GLB lớn qua mạng; thời gian tải bằng 0; dễ dàng tùy biến kích thước nhà bằng tham số (width, height, depth).
- **Nhược điểm:** Đồ nội thất (sofa, bồn rửa, đèn chùm, cây cảnh) nếu dựng bằng code sẽ thô kệch, tốn CPU sinh vertex, không đạt chuẩn photorealistic của bất động sản thương mại cao cấp.
- **Đánh giá:** Rất tốt cho prototype, wireframe, chế độ xem phân tích mặt bằng kết cấu.

### Phương pháp B: Dùng mô hình 3D đóng gói sẵn từ Blender (Pure Static GLB)
- **Cơ chế:** Xuất toàn bộ ngôi nhà gồm ngoại thất, nội thất, ánh sáng nướng (baked lighting) vào 1 file GLB duy nhất.
- **Ưu điểm:** Chất lượng hình ảnh rất cao do nghệ sĩ dựng hình can thiệp; ánh sáng nướng sẵn cực đẹp và nhẹ cho GPU.
- **Nhược điểm:** Dung lượng file có thể từ 40MB - 100MB nếu không nén; khó tùy biến từng món đồ nội thất (khó đổi riêng chất liệu sofa, sàn gỗ hay di chuyển tường); khó tái sử dụng cho hệ thống nhiều nhà khác nhau.

### Phương pháp C: Giải pháp Lai (Hybrid Architecture - KHUYÊN DÙNG CHO SẢN PHẨM THỰC TẾ)
- **Cơ chế:**
  1. Kiến trúc vỏ nhà (Townhouse Shell: kết cấu móng, tầng, tường bao, mái, ô cửa) và các mô-đun nội thất cốt lõi (Modular Furniture Assets) được chuẩn hóa theo tỷ lệ thực tế (đơn vị: mét, 1 unit = 1m).
  2. Dữ liệu căn nhà được cấu hình qua tệp **Property Metadata Schema (JSON)** định nghĩa tọa độ phòng, vị trí cửa, điểm ngắm camera, điểm tương tác (hotspots), và danh mục vật liệu có thể thay đổi.
  3. Mô hình có thể tải linh hoạt: hỗ trợ cả mô hình hình học thủ tục độ nét cao (Procedural High-Fidelity Townhouse) để chạy tức thì không phụ thuộc mạng, đồng thời có Asset Pipeline sẵn sàng nạp các tệp GLB ngoại vi được nén bằng Draco/Meshopt.
- **Đánh giá:** Đạt điểm 10/10 về tính khả thi thương mại, tốc độ tải ban đầu, tính tùy biến và khả năng nhân rộng ra hàng ngàn bất động sản khác nhau.

---

## 4. CHIẾN LƯỢC ÁNH SÁNG & CHẤT LƯỢNG HÌNH ẢNH (PBR & LIGHTING PIPELINE)

1. **Tone Mapping & Color Space:**
   - Sử dụng `THREE.ACESFilmicToneMapping` kết hợp `renderer.outputColorSpace = THREE.SRGBColorSpace`. Đây là tiêu chuẩn bắt buộc của điện ảnh và đồ họa kiến trúc cao cấp, giúp vùng sáng từ cửa sổ không bị cháy trắng (blown-out highlights) và vùng tối giữ được chi tiết trung thực.
   - Exposure điều chỉnh động: Bên ngoài nhà (Exterior) đặt `exposure = 0.9 - 1.0`, khi camera di chuyển vào trong nội thất (Interior), hệ thống chuyển đổi phơi sáng tự động thích ứng với ánh sáng phòng (Auto-Exposure Adaption).

2. **Hệ thống chiếu sáng kép (Exterior vs Interior Transition):**
   - **Ngoại thất:** `DirectionalLight` (mô phỏng mặt trời) với bóng mềm `PCFSoftShadowMap` (độ phân giải shadow map 2048x2048) tạo bóng đổ sắc nét của mái hiên, ban công; kết hợp `AmbientLight` và `HemisphereLight` màu xanh vòm trời nhạt để làm dịu bóng râm.
   - **Nội thất:** Bổ sung các nguồn sáng ấm (Warm Interior Lighting 3000K-3500K) tại phòng khách, phòng ngủ và nhà bếp: `PointLight` và `SpotLight` có khoảng suy giảm (decay = 2) vật lý; cửa sổ lắp kính PBR với độ trong suốt (transmission, roughness thấp) cho phép ánh sáng tự nhiên xuyên thấu.

3. **Chống Z-Fighting & Hiện tượng nhấp nháy:**
   - Thiết lập `camera.near = 0.1` và `camera.far = 1000`. Tuyệt đối không đặt `near` quá nhỏ (ví dụ 0.0001) vì sẽ làm giảm độ chính xác của 24-bit Depth Buffer.
   - Các mặt phẳng sàn và thảm nội thất được nâng cao chênh lệch ít nhất `0.005m` (5mm) hoặc sử dụng `polygonOffset: true` để tránh nhấp nháy bề mặt.

---

## 5. THIẾT KẾ TRẢI NGHIỆM CAMERA ĐỘT PHÁ (SCROLL-DRIVEN TRANSITION)

Trải nghiệm mở màn là điểm nhấn ấn tượng nhất của sản phẩm:
1. **Giai đoạn 1 (Toàn cảnh bên ngoài):** Người dùng thấy ngôi nhà phố từ góc nhìn Orbit tự do, chiêm ngưỡng mặt tiền hiện đại, cây xanh, ban công kính và ánh nắng.
2. **Giai đoạn 2 (Lăn chuột tiến sát):** Khi người dùng lăn con lăn chuột (hoặc vuốt trên màn hình cảm ứng), hệ thống bắt sự kiện `wheel` và tính toán trọng số tiến độ `scrollProgress` (từ 0.0 đến 1.0). Camera di chuyển dọc theo đường cong toán học (Catmull-Rom Spline) hướng thẳng tới sảnh chính và cửa ra vào.
3. **Giai đoạn 3 (Xuyên cửa vào nhà):** Khi `scrollProgress` đạt ngưỡng 0.8 - 1.0, cánh cửa kính/gỗ tự động mở ra với hiệu ứng âm thanh/chuyển động nhẹ, camera trôi qua ngạch cửa và bước vào phòng khách nội thất.
4. **Giai đoạn 4 (Khám phá nội thất):** Camera chuyển mượt sang chế độ `INTERIOR_EXPLORATION`. Lúc này, chuột quay trở lại vai trò xoay góc nhìn 360°, click vào các Hotspots (phòng khách, bếp, phòng ngủ tầng 2, ban công) để di chuyển tức thì hoặc chuyển sang chế độ Dollhouse/Floorplan.
5. **Đồng bộ Form Đăng nhập:** Form đăng nhập xuất hiện dưới dạng một tấm kính mờ thủy tinh (Frosted Glass Panel) tinh tế ở góc phải hoặc chính giữa khi người dùng dừng lại trước cửa hoặc khi nhấn nút "Đăng nhập ngay". Người dùng có thể đăng nhập bất cứ lúc nào mà không cần hoàn thành việc lăn chuột.

---

## 6. KẾT LUẬN & ĐỀ XUẤT HÀNH ĐỘNG
- **Framework cốt lõi:** Three.js r170+, TypeScript, Vite.
- **Phong cách giao diện:** Luxury Dark Glassmorphism, phong cách kiến trúc tối giản hiện đại.
- **Phương pháp kiến trúc:** Modular Component Architecture với Camera State Machine và Property Metadata Engine.
- Tiến hành bước tiếp theo: Soạn thảo bảng đánh giá chi tiết Repository GitHub (`docs/research/REPOSITORY_EVALUATION.md`) và thiết kế tài liệu kiến trúc.
