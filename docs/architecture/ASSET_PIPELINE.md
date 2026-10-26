# QUY TRÌNH QUẢN LÝ ASSET 3D & METADATA BẤT ĐỘNG SẢN (ASSET PIPELINE)
**Tài liệu:** `docs/architecture/ASSET_PIPELINE.md`  
**Chuyên mục:** Tiêu chuẩn hóa mô hình 3D, tối ưu hóa và cấu trúc dữ liệu Metadata  

---

## 1. TIÊU CHUẨN KỸ THUẬT CHO MÔ HÌNH 3D (3D MODEL SPECIFICATIONS)

Mọi mô hình nhà phố và nội thất đưa vào nền tảng phải tuân thủ nghiêm ngặt các quy chuẩn:
1. **Hệ tọa độ & Tỷ lệ (Units & Coordinate System):**
   - Đơn vị đo: **Mét (Metric System)**. `1.0 unit = 1.0 meter`.
   - Chiều không gian: Chuẩn Three.js / WebGL / glTF (`+Y` là hướng thẳng đứng lên trời, `+Z` là hướng từ trong nhà ra mặt tiền, `+X` là hướng sang phải).
   - Tọa độ gốc `(0, 0, 0)`: Đặt tại tâm sàn tầng trệt của sảnh đón chính.

2. **Quy ước đặt tên Mesh & Node (Naming Conventions):**
   - Vỏ nhà ngoại thất: `EXT_Facade`, `EXT_Roof`, `EXT_Balcony_Glass`, `EXT_Columns`.
   - Cửa ra vào tương tác: `DOOR_Main_Frame`, `DOOR_Main_Leaf` (tâm xoay pivot đặt chuẩn mép lề cửa).
   - Không gian phòng: `ROOM_GF_Living`, `ROOM_GF_Kitchen`, `ROOM_L1_MasterBed`.
   - Đồ nội thất thay thế được: `FURN_Sofa_Seating`, `FURN_Coffee_Table`, `FURN_TV_Cabinet`, `FURN_Dining_Set`.
   - Bề mặt thay đổi chất liệu: `MAT_Floor_Living`, `MAT_Wall_Living`, `MAT_Sofa_Fabric`.

3. **Chỉ tiêu Đa giác & Kích thước File (Budget & Performance Targets):**
   - Ngôi nhà hoàn chỉnh (gồm ngoại thất và đồ nội thất cơ bản): Tối đa **150,000 đa giác (triangles)**.
   - Dung lượng tệp GLB tối ưu: Dưới **15MB** (sau khi nén Draco).
   - Kích thước Texture Maps: Độ phân giải tối đa `2048x2048` cho các mảng tường/sàn lớn, `1024x1024` cho đồ nội thất nhỏ. Sử dụng định dạng JPG/WebP hoặc nén KTX2.

---

## 2. CẤU TRÚC DỮ LIỆU METADATA BẤT ĐỘNG SẢN (JSON SCHEMA)

Mỗi căn nhà được lưu trữ dưới dạng cấu hình dữ liệu độc lập, cho phép nạp động không cần sửa mã nguồn:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "propertyId": "house-vn-townhouse-01",
  "title": "Nhà Phố Hiện Đại 2 Tầng - The Green Horizon",
  "type": "Townhouse",
  "address": "Khu đô thị Sala, Quận 2, TP. Thủ Đức, TP. Hồ Chí Minh",
  "price": {
    "value": 12500000000,
    "currency": "VND",
    "display": "12.5 Tỷ VNĐ"
  },
  "specifications": {
    "landArea": "100 m² (5m x 20m)",
    "usableArea": "180 m²",
    "floors": 2,
    "bedrooms": 3,
    "bathrooms": 3,
    "direction": "Đông Nam",
    "status": "Đang mở bán"
  },
  "assetUrls": {
    "modelGlb": "/assets/models/townhouse_01.glb",
    "thumbnail": "/assets/images/townhouse_thumb.webp",
    "environmentMap": "/assets/hdr/suburban_sky_1k.hdr"
  },
  "cameraWaypoints": {
    "exterior": { "position": [14, 8, 18], "target": [0, 3.5, 0] },
    "entranceApproach": { "position": [0, 1.8, 5.5], "target": [0, 1.65, 0] },
    "frontDoor": { "position": [0.2, 1.65, 2.4], "target": [0.2, 1.65, -1] },
    "interiorEntrance": { "position": [0, 1.65, -2.5], "target": [0, 1.65, -5.5] },
    "dollhouse": { "position": [0, 16, 16], "target": [0, 3, 0] },
    "floorplan": { "position": [0, 22, 0.001], "target": [0, 0, 0] }
  },
  "hotspots": [
    {
      "id": "hs-living-room",
      "name": "Phòng Khách Sang Trọng",
      "position": [0, 1.2, -3.2],
      "cameraView": { "position": [0, 1.65, -2.8], "target": [0, 1.4, -6.0] },
      "description": "Không gian sinh hoạt chung rộng 35m² với hệ thống sofa bọc nỉ cao cấp và vách TV ốp đá Marble."
    },
    {
      "id": "hs-dining-kitchen",
      "name": "Bếp Ăn Hiện Đại",
      "position": [-1.8, 1.2, -6.2],
      "cameraView": { "position": [-0.5, 1.65, -5.5], "target": [-2.2, 1.4, -6.8] },
      "description": "Tủ bếp acrylic bóng gương An Cường, mặt đá thạch anh chống trầy xước và bồn rửa nano cao cấp."
    },
    {
      "id": "hs-master-bed",
      "name": "Phòng Ngủ Master",
      "position": [0, 4.6, -3.5],
      "cameraView": { "position": [0, 5.0, -2.5], "target": [0, 4.8, -5.8] },
      "description": "Phòng ngủ chính lầu 1 đón trọn gió mát hướng Đông Nam, sàn lát gỗ sồi Châu Âu."
    },
    {
      "id": "hs-balcony",
      "name": "Ban Công Lầu 1",
      "position": [0, 4.6, 2.5],
      "cameraView": { "position": [0, 5.0, 1.0], "target": [0, 4.8, 6.0] },
      "description": "Tầm nhìn thoáng đãng ngắm trọn công viên cây xanh nội khu, lan can kính cường lực an toàn."
    }
  ],
  "customizableMaterials": {
    "sofaFabric": [
      { "id": "fabric-charcoal", "name": "Xám Ghi Cao Cấp", "color": "#383b42", "roughness": 0.85 },
      { "id": "fabric-navy", "name": "Xanh Ngọc Navy", "color": "#1b2a47", "roughness": 0.8 },
      { "id": "fabric-cream", "name": "Be Cát Tự Nhiên", "color": "#d6cec2", "roughness": 0.9 }
    ],
    "floorMaterial": [
      { "id": "floor-wood", "name": "Gỗ Sồi Châu Âu", "color": "#b58750", "roughness": 0.35 },
      { "id": "floor-marble", "name": "Đá Cẩm Thạch Trắng", "color": "#e8e8e8", "roughness": 0.15 },
      { "id": "floor-concrete", "name": "Bê Tông Mài Hiện Đại", "color": "#808285", "roughness": 0.55 }
    ]
  }
}
```

---

## 3. CƠ CHẾ DỰ PHÒNG & XỬ LÝ LỖI (FALLBACK & ERROR RECOVERY)

Nếu quá trình nạp mô hình GLB bên ngoài gặp sự cố (mạng chậm, lỗi 404, file hỏng):
1. **Trình bao bọc lỗi (`AssetLoaderGuard`):** Bắt sự kiện lỗi nạp asset.
2. **Kích hoạt Procedural Townhouse Engine:** Tự động dựng mô hình nhà mẫu dự phòng chất lượng cao bằng mã nguồn hình học tích hợp sẵn.
3. **Hiển thị thông báo thân thiện:** Thông báo cho người dùng trên HUD rằng hệ thống đang kích hoạt chế độ xem tối ưu tốc độ, kèm nút "Thử tải lại mô hình gốc". Người dùng vẫn có thể đăng nhập, xem thông số nhà và tương tác mà không bị màn hình trắng (White Screen of Death).
