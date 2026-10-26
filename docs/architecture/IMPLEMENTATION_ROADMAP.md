# LỘ TRÌNH TRIỂN KHAI VÀ MỞ RỘNG NỀN TẢNG (IMPLEMENTATION ROADMAP)
**Tài liệu:** `docs/architecture/IMPLEMENTATION_ROADMAP.md`  
**Chuyên mục:** Kế hoạch thực hiện từng giai đoạn và hướng phát triển thương mại  

---

## 1. GIAI ĐOẠN 1: NỀN TẢNG VÀ BẢN THỬ NGHIỆM ĐỘT PHÁ (MVP & PROTOTYPE) - ĐANG THỰC HIỆN
- **Mục tiêu:** Xây dựng một ứng dụng Web 3D hoàn chỉnh chứng minh toàn bộ năng lực kiến trúc và trải nghiệm người dùng theo đúng đề bài.
- **Hạng mục bàn giao:**
  1. Khởi tạo môi trường dự án với Vite, TypeScript và Three.js.
  2. Dựng mô hình nhà phố 2 tầng hiện đại (High-Fidelity Architectural Shell) với ngoại thất, ban công kính, cửa chính mở cơ học và nội thất tiện nghi.
  3. Cài đặt hệ thống ánh sáng chuyên nghiệp (PBR, PCF Soft Shadows, ACES Filmic Tone Mapping).
  4. Triển khai Camera State Machine hỗ trợ cuộn chuột lướt vào cửa chính và chuyển tiếp vào phòng khách mượt mà.
  5. Triển khai các chế độ xem: Ngoại thất, Nội thất 360°, Cắt lớp Dollhouse và Mặt bằng Floor Plan.
  6. Xây dựng giao diện Đăng nhập / Đăng ký Glassmorphism cao cấp, không cản trở góc nhìn 3D.
  7. Bảng điều khiển cấu hình vật liệu thời gian thực (đổi chất liệu sofa, sàn nhà).
  8. Điểm tương tác Hotspots di chuyển tức thì giữa các phòng.

---

## 2. GIAI ĐOẠN 2: TÍCH HỢP HỆ THỐNG QUẢN LÝ ĐA BẤT ĐỘNG SẢN (MULTI-PROPERTY PLATFORM)
- **Mục tiêu:** Cho phép người dùng chuyển đổi qua lại giữa hàng loạt căn nhà phố, biệt thự và căn hộ khác nhau trên cùng một trang web.
- **Hạng mục phát triển:**
  1. Thanh tìm kiếm và bộ lọc bất động sản (Lọc theo mức giá, vị trí, diện tích, số phòng ngủ).
  2. Nạp bất động sản theo `propertyId` thông qua URL Router (ví dụ `/properties/villa-district-2`).
  3. Trình chuyển đổi căn nhà mượt mà: camera trôi lùi ra xa, mô hình nhà cũ giải phóng bộ nhớ GPU và mô hình nhà mới được nạp vào tức thì.

---

## 3. GIAI ĐOẠN 3: TÍNH NĂNG THƯƠNG MẠI HÓA CAO CẤP (ENTERPRISE & COMMERCIALIZATION)
- **Mục tiêu:** Chuyển giao hệ thống cho các sàn giao dịch bất động sản và chủ đầu tư lớn.
- **Hạng mục phát triển:**
  1. **Tư vấn trực tuyến qua WebRTC / Co-browsing:** Môi giới và khách hàng có thể cùng đi dạo trong căn nhà 3D, chia sẻ góc nhìn camera theo thời gian thực.
  2. **Trải nghiệm thực tế ảo WebXR:** Hỗ trợ kính VR (Meta Quest, Apple Vision Pro) cho phép khách hàng đeo kính và bước đi trực tiếp trong nhà.
  3. **Hệ thống đặt cọc & Đăng ký tham quan trực tiếp:** Tích hợp cổng thanh toán trực tuyến và đặt lịch hẹn chuyên viên tư vấn.
