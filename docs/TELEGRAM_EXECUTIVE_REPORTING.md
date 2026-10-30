# HƯỚNG DẪN TÍCH HỢP & SỬ DỤNG BOT ĐIỀU HÀNH BÁO CÁO CHO SẾP (TELEGRAM)
**Tài liệu:** `docs/TELEGRAM_EXECUTIVE_REPORTING.md`  
**Dự án:** Nền Tảng Web 3D Bất Động Sản (AURA 3D Real Estate / PRJ_048)  
**Bot điều hành chính thức:** `@BAHA_DieuHanh_bot` (Bot ID: `8684276925`)  
**Người nhận báo cáo:** Founder Nguyễn Cảnh Diệu (Chat ID: `7775586213`, `@dieubaha`)  
**Trạng thái tích hợp:** `HOÀN THÀNH — PRODUCTION READY`  

---

## 1. TỔNG QUAN HỆ THỐNG ĐIỀU HÀNH TELEGRAM BAHA

Hệ thống báo cáo điều hành tự động được tích hợp trực tiếp vào dự án nhằm chuẩn hóa luồng báo cáo công việc hằng ngày từ kỹ sư / người phụ trách tới Founder (Nguyễn Cảnh Diệu).

### Ma trận định danh & Kênh tiếp nhận:
| Vai trò / Thực thể | Định danh kỹ thuật | Mô tả / Nguyên tắc bảo mật |
| :--- | :--- | :--- |
| **Bot Điều Hành** | `@BAHA_DieuHanh_bot` (ID: `8684276925`) | Bot chính thức duy nhất dùng để phát bản tin điều hành. |
| **Bot Chấm Công** | `Baha_ChamCongBot` (ID: `8660244994`) | **BỊ CẤM TUYỆT ĐỐI** (`PROHIBITED_BOT_REJECTED`). Không bao giờ gửi nhầm. |
| **Người nhận (Founder)** | `7775586213` (`@dieubaha`) | Khung chat riêng tư (`type: private`). Nhận 1 bảng báo cáo tổng hợp. |
| **Nhóm chung** | ID âm (ví dụ: `-1003995507922`) | **BỊ CHẶN HOÀN TOÀN** (`GROUP_RECIPIENT_REJECTED`) để tránh làm phiền và rò rỉ bảo mật. |
| **Chế độ mô phỏng an toàn** | `CHO_KET_NOI` | Khi chưa nạp Token thực tế, hệ thống vẫn kiểm tra cấu trúc, độ dài, format Markdown và tự động copy vào Clipboard mà không gây lỗi runtime. |

---

## 2. CHUẨN MẪU BÁO CÁO CÔNG VIỆC HẰNG NGÀY

Bản tin báo cáo tuân thủ nghiêm ngặt định dạng Markdown của Telegram, độ dài tối ưu dưới 4.096 ký tự:

```text
📊 BÁO CÁO CÔNG VIỆC HẰNG NGÀY — PRJ_048
📅 Ngày: 2026-10-27 (18:25)
📁 Dự án: Nền Tảng Web 3D Bất Động Sản Nhập Vai (AURA 3D Real Estate) (PRJ_048)
👤 Người phụ trách: Trịnh Công Sơn

✅ ĐÃ HOÀN THÀNH
• Tích hợp bộ tùy biến vật liệu nội thất 3D & đổi màu sắc PBR thời gian thực (Dynamic Customizer Store).
• Giới hạn vùng xoay 360 độ góc nhìn nội thất an toàn, triệt tiêu hoàn toàn góc nhìn xuyên thủng tường/trần.
• Tối ưu hóa con lăn chuột và camera quán tính (Aura Inertial Navigation), duy trì 60 FPS ổn định.
• Tích hợp báo cáo điều hành tự động hàng ngày qua bot @BAHA_DieuHanh_bot.

🛠️ ĐÃ SỬA LỖI
• Khắc phục hiện tượng giật lag khi chuyển đổi giữa chế độ Tham quan (Orbit) và Xem Dollhouse.
• Khắc phục va chạm camera lọt ra ngoài phòng khách khi xoay góc cực đại.

🚀 ĐÃ NÂNG CẤP / TRIỂN KHAI
• Bản nháp Staging (cổng 5173 (Dev)): SẴN SÀNG
• Bản chính Production (dist bundle WebGL): ĐÃ ĐÓNG GÓI

🧪 KIỂM THỬ
• Kết quả: ĐẠT 100% 60 FPS, WebGL Shader PBR hoàn tất trong 0.45s

⏳ ĐANG THỰC HIỆN
• Kiểm thử trải nghiệm điều khiển trên thiết bị di động và các màn hình độ phân giải thấp.

⚠️ VƯỚNG MẮC
• Không có vướng mắc.

📌 KẾ HOẠCH TIẾP THEO
• Mở rộng thư viện vật liệu cao cấp (đá marble, gỗ óc chó, kính tán sắc).
• Hoàn thiện chế độ hiển thị mặt bằng 2D Floor Plan kết hợp Mini-map.

🔗 XEM CHI TIẾT: Báo cáo điều hành PRJ_048
```

---

## 3. CÁCH SỬ DỤNG TRÊN GIAO DIỆN WEB 3D (GUI)

1. Mở ứng dụng Web 3D (`npm run dev` hoặc truy cập `http://localhost:5173`).
2. Trên thanh tiêu đề (Header Bar), bấm nút **"Báo Cáo Sếp"** (biểu tượng huy hiệu xanh).
3. Hộp thoại **Executive Reporting Modal** (giao diện Kính mờ Luxury Dark Glassmorphism) hiển thị:
   - **Tab Soạn Thảo & Xem Trước:**
     - Cho phép chọn nhanh mẫu: **Dự Án Web 3D (PRJ_048)** hoặc **Săn Khách Hàng (PRJ_059)**.
     - Cho phép chỉnh sửa nhanh các đầu mục: Đã hoàn thành, Sửa lỗi, Cổng Staging/Prod, Kiểm thử, Vướng mắc, Kế hoạch.
     - Cột phải hiển thị xem trước Markdown thời gian thực kèm bộ đếm ký tự (`charCount / 4096`).
   - **Tab Cấu Hình:**
     - Hiển thị định danh bot `@BAHA_DieuHanh_bot` (8684276925) và Chat ID Founder (`7775586213`).
     - Cho phép dán Token bot để gửi trực tiếp, hoặc để trống để chạy Chế độ mô phỏng an toàn.
   - **Các nút chức năng:**
     - **Sao Chép Markdown:** Sao chép 1-click vào Clipboard.
     - **Tải File .md:** Lưu tệp báo cáo về máy tính.
     - **Gửi Báo Cáo Cho Sếp:** Gửi trực tiếp qua Telegram Bot API (khi có Token) hoặc kích hoạt chế độ mô phỏng an toàn có thông báo rõ ràng.

---

## 4. CÁCH SỬ DỤNG QUA TERMINAL CLI & POWERSHELL

Bạn có thể chạy kiểm tra hoặc phát báo cáo trực tiếp từ dòng lệnh:

### Xem trước báo cáo & tự động đưa vào Clipboard:
```bash
npm run report
```
*(Lệnh trên sẽ in báo cáo Markdown đẹp mắt trên terminal và tự động sao chép vào Clipboard để bạn chỉ cần bấm Ctrl+V vào Telegram gửi cho Sếp).*

### Xem mẫu của dự án khác (ví dụ PRJ_059):
```bash
npm run report:059
```

### Phát tin thật trực tiếp sang Telegram của Sếp (khi đã cấu hình TELEGRAM_BOT_TOKEN trong .env):
```bash
npm run report:send
```

### Chạy bằng PowerShell script:
```powershell
# Xem trước & copy clipboard
.\scripts\send_daily_report.ps1

# Phát tin thật trực tiếp
.\scripts\send_daily_report.ps1 -Send

# Tùy biến người phụ trách và mã dự án
.\scripts\send_daily_report.ps1 -Project "PRJ_048" -Author "Trịnh Công Sơn"
```

---

## 5. CHỨNG THỰC BẢO MẬT & KIỂM THỬ TỰ ĐỘNG

Chạy bộ kiểm thử tự động toàn diện:
```bash
npm run test:report
```

Kết quả kiểm thử tự động (`23/23 PASS 100%`):
- `[PASS]` RealWeb report contains project code PRJ_048
- `[PASS]` RealWeb report contains header emoji & all required sections
- `[PASS]` PRJ_059 report matches exact title & content structure
- `[PASS]` Độ dài bản tin nằm trong giới hạn Telegram (1.340 / 4.096 ký tự)
- `[PASS]` Tự động chặn gửi vào nhóm chat ID âm (`GROUP_RECIPIENT_REJECTED`)
- `[PASS]` Tự động chặn bot chấm công `8660244994` (`PROHIBITED_BOT_REJECTED`)
- `[PASS]` Xác thực đích đến riêng tư Founder `7775586213`
- `[PASS]` Chế độ mô phỏng an toàn (`CHO_KET_NOI`) hoạt động hoàn hảo khi chưa có token.
