# QUY TRÌNH NGHIỆM THU GIAO DIỆN (GUI ACCEPTANCE GUIDE)

**Mã tài liệu:** `AURA_SCROLL_V3_ACCEPTANCE_GUI.md`  
**Dành cho:** Chủ dự án / Founder nghiệm thu trực tiếp trên màn hình trình duyệt.  
**Yêu cầu:** Hoàn toàn bằng thao tác giao diện chuột, không cần gõ lệnh dòng lệnh (CLI).

---

## 1. Địa Chỉ Truy Cập Môi Trường Nghiệm Thu

* **Địa chỉ URL QA/Dev:** `http://localhost:5173`
* **Môi trường:** Google Chrome trên máy tính của bạn.

---

## 2. Các Bước Nghiệm Thu Chi Tiết

### Bước 1: Mở Bảng Điều Khiển QA Benchmark HUD
1. Truy cập vào `http://localhost:5173`.
2. Quan sát góc trên bên phải màn hình: Bảng điều khiển kính mờ **AURA V3 QA BENCHMARK** sẽ tự động hiển thị (hoặc bấm phím **`F2`** trên bàn phím để bật/tắt).
3. Xác nhận trên thanh điều khiển:
   - Nút **`V3: 5 Cấp Chuẩn`** đang sáng đèn tím (kích hoạt).
   - Nút **`B: 1080p V3`** đang sáng đèn xanh dương (chuẩn Full HD).
   - Huy hiệu góc trên hiển thị: **`3D: SLEEP`** (màu xanh lá — xác nhận Three.js đang ngủ, giải phóng GPU).
   - Trạng thái hiện tại: `Cấp 0 (Khởi đầu) | Frame: 0/276 (Video 1)`.

---

### Bước 2: Kiểm Tra 5 Cấp Cuộn Chuột Video 1 (Cấp 1 $\rightarrow$ Cấp 5)
1. Đặt con trỏ chuột vào vùng giữa màn hình.
2. **Lăn chuột xuống đúng 1 khấc nhẹ nhàng:**
   - Quan sát camera lướt êm ái chuyển động liên tục từ **Cấp 1 (Frame 0: Toàn cảnh)** tới **Cấp 2 (Frame 30: Góc phố)**.
   - Nút `2: Góc phố` trên HUD và chip `2 Góc phố` ở thanh lộ trình đáy màn hình sáng lên.
3. **Lăn chuột xuống lần thứ 2:** Camera lướt tới **Cấp 3 (Frame 60: Ranh giới)**.
4. **Lăn chuột xuống lần thứ 3:** Camera lướt tới **Cấp 4 (Frame 90: Mặt tiền)**.
5. **Lăn chuột xuống lần thứ 4:** Camera lướt tới **Cấp 5 (Frame 119: Trước cổng)** và dừng lại ngay trước cổng nhà (kết thúc Video 1).
   - *Xác nhận:* Độ trễ vẽ hình <0.15ms nhờ 120 frame đã nạp sẵn vào RAM, không còn bất kỳ hiện tượng giật lag hay khựng hình nào.

---

### Bước 3: Kiểm Tra Cuộn Ngược Chiều (Không Khựng, Không Reset)
1. Từ Cấp 5, **lăn chuột ngược lên từng khấc:**
   - Cấp 5 $\rightarrow$ Cấp 4 $\rightarrow$ Cấp 3 $\rightarrow$ Cấp 2 $\rightarrow$ Cấp 1.
   - *Xác nhận:* Video lùi mượt tuyệt đối, không bị khựng chờ tải lại ảnh từ mạng, không bị chớp đen và không bị nhảy về Frame 0.

---

### Bước 4: Kiểm Tra Đảo Chiều Ngay Khi Đang Di Chuyển (Mid-Flight Reversal)
1. Đang ở Cấp 1, bấm hoặc lăn chuột tiến về Cấp 3.
2. **Ngay khi camera đang lướt giữa đường (khoảng Cấp 2), lập tức lăn chuột ngược lại:**
   - *Xác nhận:* Camera lập tức đổi hướng lùi êm ái từ vị trí đang đứng, không bị chờ chạy hết quãng cũ, không giật cục.

---

### Bước 5: Kiểm Tra Nút Bấm Điều Hướng Trực Tiếp (Stage Jump)
1. Bấm trực tiếp vào nút **`5: Trước cổng`** trên HUD hoặc chip **`5 Trước cổng`** ở thanh đáy:
   - Camera lướt một mạch từ đầu đến trước cổng trong ~320ms mượt mà.
2. Bấm trực tiếp vào nút **`1: Toàn cảnh`**:
   - Camera lướt lùi nhanh và êm về lại toàn cảnh trên cao.
3. Bấm thử các nút `2: Góc phố`, `3: Ranh giới`, `4: Mặt tiền`:
   - Mọi mốc đều di chuyển chính xác và hiển thị nhãn cảnh tương ứng.

---

### Bước 6: Kiểm Tra Chuyển Tiếp Sang Video 2 & Nội Thất 3D
1. Từ Cấp 5 (Frame 119), lăn tiếp 2-3 khấc chuột tiến:
   - Hệ thống chuyển tiếp vào Video 2 (tiến sát cửa nhà).
2. Khi tiến tới ngưỡng mở cửa (`progress >= 0.60`):
   - Huy hiệu trên HUD đổi từ `3D: SLEEP` $\rightarrow$ `3D: PREWARM` $\rightarrow$ `3D: ACTIVE`.
   - Cửa nhà mở ra và camera bước vào phòng khách 3D mượt mà không nháy đen.
3. Lăn chuột lùi lại từ phòng khách ra ngoài sân:
   - Camera lùi ra ngoài, huy hiệu chuyển lại `3D: SLEEP`.

---

### Bước 7: So Sánh 3 Chế Độ A / B / C
1. Bấm nút **`A: 720p`**: Hình ảnh chuyển sang variant nhẹ 720p, tải RAM giảm xuống chỉ còn ~30MB.
2. Bấm nút **`B: 1080p V3`**: Hình ảnh Full HD sắc nét, rõ từng nan sắt và vân gạch.
3. Bấm nút **`C: Adaptive`**: Tự động nhận diện cấu hình máy.

---

### Bước 8: Kiểm Tra Thử Nghiệm Rollback (Đường Lùi V2)
1. Bấm nút **`V2: Tự Do (Rollback)`** trên HUD:
   - Hệ thống chuyển về cơ chế cuộn tự do V2 cũ.
2. Bấm lại **`V3: 5 Cấp Chuẩn`**:
   - Hệ thống quay lại 5 cấp chuẩn V3 mượt mà tức thì.

---

## 3. Tiêu Chí Đánh Giá Nghiệm Thu

| Mục kiểm tra | Kết quả mong đợi | Đánh giá Founder |
| :--- | :--- | :---: |
| 1. Đúng 5 cấp cuộn tiến | 5 lần lăn chuột đi từ Cấp 0 đến Cấp 5 | [  ] ĐẠT / [  ] CHƯA |
| 2. Đúng 5 cấp cuộn lùi | 5 lần lăn chuột lùi từ Cấp 5 về Cấp 0 | [  ] ĐẠT / [  ] CHƯA |
| 3. Độ mượt nội suy | Không teleport 40 frames, không giật khấc | [  ] ĐẠT / [  ] CHƯA |
| 4. Đảo chiều mid-flight | Đổi hướng êm ái tức thì từ vị trí hiện tại | [  ] ĐẠT / [  ] CHƯA |
| 5. Độ nét 1080p | Sắc nét, không méo hình, đúng tỷ lệ | [  ] ĐẠT / [  ] CHƯA |
| 6. Three.js GPU Sleep | Huy hiệu SLEEP màu xanh khi xem video | [  ] ĐẠT / [  ] CHƯA |
| 7. Nút nhảy cấp trực tiếp | Nhấn nút số 0..5 chuyển động chuẩn xác | [  ] ĐẠT / [  ] CHƯA |
| 8. Đường lùi Rollback | Bật/tắt V2/V3 tức thì không lỗi | [  ] ĐẠT / [  ] CHƯA |
