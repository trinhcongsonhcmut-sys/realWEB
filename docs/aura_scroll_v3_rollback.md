# HƯỚNG DẪN ROLLBACK VỀ PHIÊN BẢN V2 (ROLLBACK PROCEDURES)

**Mã tài liệu:** `AURA_SCROLL_V3_ROLLBACK.md`  
**Dự án:** AURA 3D Real Estate Platform  
**Phiên bản:** V3.0  
**Mục đích:** Cung cấp phương án chuyển đổi an toàn và tức thì về phiên bản V2 trong trường hợp Founder hoặc QA muốn giữ lại cơ chế cuộn cũ.

---

## 1. Phương Án 1: Rollback Bằng Giao Diện GUI Tức Thì (Không Cần Code)

Hệ thống V3 được thiết kế với cơ chế **Runtime Feature Flag `motionVersion`**:

1. Mở trang web tại `http://localhost:5173`.
2. Mở bảng điều khiển HUD bằng phím **`F2`**.
3. Tại dòng **`MOTION ENGINE (V3 / V2 ROLLBACK)`**, bấm vào nút:
   $$\mathbf{[V2: \text{ Tự Do (Rollback)} ]}$$
4. **Hiệu lực:**
   - Hệ thống lập tức vô hiệu hóa cơ chế 5 cấp rời rạc.
   - Trở về toàn bộ hành vi cuộn tự do theo hệ số quán tính liên tục của V2.
   - Thao tác này không cần tải lại trang, không gây reload, chuyển đổi trạng thái trong 0ms.

---

## 2. Phương Án 2: Đặt Mặc Định V2 Trong Mã Nguồn

Nếu muốn hệ thống luôn khởi động ở chế độ V2 cũ làm mặc định:
Trong [`src/camera/ScrollProgressController.ts`](file:///c:/Users/Baha%20Group/Desktop/RealWeb/src/camera/ScrollProgressController.ts):
```typescript
// Dòng 26: Đổi mặc định từ 'V3' thành 'V2'
public motionVersion: MotionVersion = 'V2';
```

---

## 3. Phương Án 3: Khôi Phục Hoàn Toàn Từ File Sao Lưu (Hard Rollback)

Các file mã nguồn của phiên bản V2 trước khi nâng cấp đã được đóng băng và sao lưu tại:
- `src/camera/ScrollProgressController.v2.bak`
- `src/video/VideoScrollerControllerV2.v2.bak`
- `src/ui/QualityBenchmarkHUD.v2.bak`

Lệnh khôi phục nhanh qua PowerShell (khi cần hard rollback):
```powershell
Copy-Item 'src/camera/ScrollProgressController.v2.bak' 'src/camera/ScrollProgressController.ts' -Force
Copy-Item 'src/video/VideoScrollerControllerV2.v2.bak' 'src/video/VideoScrollerControllerV2.ts' -Force
Copy-Item 'src/ui/QualityBenchmarkHUD.v2.bak' 'src/ui/QualityBenchmarkHUD.ts' -Force
npm.cmd run build
```

---

## 4. Các Giới Hạn & Đảm Bảo An Toàn

1. **Tuyệt đối an toàn dữ liệu:** Quá trình nâng cấp không can thiệp, không thay đổi và không ghi đè bất kỳ file video gốc nào trong `public/assets/references/`.
2. **Không xung đột hạ tầng:** Hoạt động độc lập trên local port 5173 của Vite, hoàn toàn không chạm vào cổng Production (18132) hay Staging (18131).
3. **Bảo toàn 100% chức năng:** Hệ thống nội thất 3D, Walkthrough Spline, Hotspots, Furniture, Lighting và Door handover được bảo toàn nguyên vẹn.
