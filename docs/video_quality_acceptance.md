# AURA ADAPTIVE HIGH-FIDELITY CANVAS V2 — HƯỚNG DẪN NGHIỆM THU DÀNH CHO FOUNDER (GUI ONLY)
**Mã tài liệu:** `docs/video_quality_acceptance.md`  
**Phiên bản:** 2.0 — Ngày 27/10/2026  
**Dành cho:** Chủ dự án / Founder / QA Lead (Không cần dùng lệnh Terminal CLI)

---

## 1. Giới Thiệu Công Cụ Nghiệm Thu Trực Quan
Để bạn có thể tự mình kiểm chứng và so sánh chất lượng hình ảnh ngay trên trình duyệt mà không cần thao tác kỹ thuật, hệ thống đã tích hợp sẵn **Bảng điều khiển nghiệm thu trực tiếp (AURA V2 QA BENCHMARK HUD)** xuất hiện ở góc trên bên phải màn hình.

> [!TIP]
> **Phím tắt nhanh:** Nhấn phím **`F2`** trên bàn phím bất cứ lúc nào để bật hoặc ẩn bảng nghiệm thu này.

---

## 2. Quy Trình 5 Bước Nghiệm Thu Chất Lượng Hình Ảnh

### Bước 1: Mở ứng dụng trên trình duyệt Google Chrome
- Bạn chỉ cần mở cửa sổ trình duyệt Chrome tại địa chỉ đang chạy của dự án:
  👉 **`http://localhost:5173/`**
- Bạn sẽ thấy ngay bảng kính mờ **AURA V2 QA BENCHMARK** hiển thị ở góc trên bên phải với chấm xanh nhấp nháy báo hiệu đo lường thời gian thực.

---

### Bước 2: So sánh trực quan độ sắc nét A (Cũ) vs B (Mới) tại các khung hình tĩnh
1. **Tại Frame 0 (Toàn cảnh khởi đầu):**
   - Click nút **`A: Baseline`** trên bảng HUD: Quan sát cụm cây xanh hai bên, ban công tầng 2 và nan sắt cổng chính -> bạn sẽ thấy hình ảnh bị mờ nhẹ và hơi vỡ nét do Canvas 720p bị kéo giãn.
   - Click nút **`B: 1080p V2`** trên bảng HUD: Ngay lập tức toàn bộ khung hình chuyển sang độ phân giải Full HD nguyên bản -> lá cây sắc nét, các thanh lam nhôm ban công thẳng tắp, đường nét kiến trúc sắc sảo.
2. **Tại Cấp 3 (Mặt tiền - Frame 119):**
   - Lăn chuột đến cấp 3 (hoặc click chip "Mặt tiền"): Bấm chuyển qua lại giữa `A` và `B` để thấy sự vượt trội về độ sắc nét của biển số nhà và khối kiến trúc mặt tiền.
3. **Tại Cấp 5 (Trước cửa - Frame 200+):**
   - Di chuyển đến trước bậc tam cấp: Chuyển đổi giữa `A` và `B` để quan sát vân đá cẩm thạch trắng trên nền đá đen kim sa và độ trong suốt của kính cửa chính.

---

### Bước 3: Kiểm tra độ mượt cuộn trang (Smoothness & FPS)
1. **Lăn chuột qua Video 1 (3 cấp đầu):**
   - Thao tác cuộn chuột tiến về phía trước: Xác nhận chỉ cần **khoảng 3 khấc cuộn** là camera lướt nhanh và êm ái đi hết video 1.
2. **Lăn tiếp nối vào Video 2:**
   - Khi hết video 1, chuyển động tiếp nối liền mạch vào video 2 mà không hề có khoảng giật hay nhảy hình.
   - Tốc độ lăn chuột ở Video 2 di chuyển từ từ chuẩn xác theo từng bước chân.
3. **Quan sát ô "FPS THỰC" trên bảng HUD:**
   - Trong suốt quá trình cuộn nhanh, cuộn chậm hoặc đảo chiều lăn ngược ra ngoài, chỉ số FPS phải duy trì ổn định ở mức **`58 - 60 FPS`** với màu xanh lá cây (Good).
   - Ô "FRAME TIME" đạt xấp xỉ **`16.6 ms`** (khớp hoàn hảo chu kỳ dựng hình của màn hình 60Hz).

---

### Bước 4: Thử nghiệm 3 mức ánh sáng Vignette (Độ trong trẻo)
Trên bảng HUD tại hàng **VIGNETTE OVERLAY**, thử click 3 chế độ:
- **`LIGHT` (Đang chọn làm mặc định):** Giảm bớt bóng đen bao phủ, giữ chiều sâu điện ảnh nhẹ nhàng mà vẫn phô diễn trọn vẹn ánh nắng tự nhiên của căn nhà.
- **`OFF`:** Tắt hoàn toàn bóng tối viền, hình ảnh sáng rõ tối đa 100%.
- **`CURRENT`:** Bật lại mức tối viền cũ để so sánh cảm giác thị giác.

---

### Bước 5: Kiểm tra tính liên tục của các tính năng 3D
- Cuộn tiếp qua ngưỡng cửa (tiến trình 70% – 76%): Cánh cửa tự động mở và hiệu ứng chuyển cảnh mượt mà đưa bạn vào phòng khách 3D Three.js.
- Khi đã vào trong phòng: Thử kéo chuột xoay 360 độ, chọn đổi màu sofa, màu sàn gỗ và màu sơn tường để đảm bảo toàn bộ hệ thống tương tác vẫn hoạt động hoàn hảo 100%.

---

## 3. Dấu Hiệu Lỗi Cần Dừng & Yêu Cầu Chỉnh Sửa
Nếu xuất hiện bất kỳ dấu hiệu nào sau đây, vui lòng thông báo cho tôi:
1. Hình ảnh bị méo tỷ lệ (ngôi nhà bị kéo bẹt hoặc co hẹp chiều ngang).
2. Khi cuộn xuất hiện khung hình màu đen nhấp nháy.
3. Chỉ số FPS tụt sâu dưới 40 FPS màu đỏ khi lăn chuột bình thường.
4. Nút bấm trên giao diện HUD hoặc các chip điều hướng bị lệch vị trí.

---

## 4. Cơ Chế Rollback An Toàn (Nếu Muốn Quay Về Bản Cũ)
Hệ thống được thiết kế hoàn toàn mô-đun hóa độc lập (Decoupled Architecture). Bản cũ và 2 video MP4 gốc vẫn nguyên vẹn 100%. Nếu bạn muốn quay về hệ thống cũ chỉ trong 1 thao tác, tôi chỉ cần chuyển biến `this.videoScroller` trong [`src/core/RealEstateViewer.ts`](file:///c:/Users/Baha%20Group/Desktop/RealWeb/src/core/RealEstateViewer.ts#L76) về lại `VideoScrollerController` gốc là xong ngay tức khắc.
