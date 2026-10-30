/**
 * ArchitectureSpecsPopup.ts
 * Medium popup detailing material specifications, lighting parameters, and engineering notes.
 */

import { PopupItem } from '../types';

export function createArchitectureSpecsPopup(): PopupItem {
  return {
    id: 'popup-architecture-specs',
    size: 'medium',
    category: 'specs',
    badge: 'SPECIFICATIONS',
    title: 'Thông Số Kỹ Thuật & Vật Liệu Cao Cấp',
    subtitle: 'Bảng tiêu chuẩn kỹ thuật hoàn thiện từ kết cấu đến nội thất',
    order: 3,
    render: () => {
      const card = document.createElement('div');
      card.className = 'popup-card popup-card-medium popup-card-specs';

      card.innerHTML = `
        <div class="popup-header">
          <div class="popup-badge-group">
            <span class="popup-badge badge-specs">MATERIAL STANDARDS</span>
            <span class="popup-badge badge-step">BƯỚC 3 / 4</span>
          </div>
          <h2 class="popup-title">Tiêu Chuẩn Hoàn Thiện</h2>
          <p class="popup-desc">Danh mục vật liệu và trang thiết bị cao cấp được ứng dụng xuyên suốt công trình.</p>
        </div>

        <div class="popup-body">
          <div class="specs-table-wrapper">
            <table class="specs-table">
              <thead>
                <tr>
                  <th>Hạng mục</th>
                  <th>Chất liệu / Tiêu chuẩn</th>
                  <th>Xuất xứ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Sàn Phòng Khách</strong></td>
                  <td>Đá cẩm thạch tự nhiên Calacatta Gold khổ lớn</td>
                  <td>Ý (Italy)</td>
                </tr>
                <tr>
                  <td><strong>Ốp Tường & Lam Gỗ</strong></td>
                  <td>Gỗ sồi nhập khẩu phủ veneer chống ẩm cao cấp</td>
                  <td>Bắc Mỹ</td>
                </tr>
                <tr>
                  <td><strong>Hệ Cửa Kính Sảnh</strong></td>
                  <td>Nhôm Slim bản viền mỏng kính hộp Low-E 3 lớp</td>
                  <td>Đức (Germany)</td>
                </tr>
                <tr>
                  <td><strong>Chiếu Sáng Thông Minh</strong></td>
                  <td>Hệ đèn từ tính âm trần CRI 98 điều khiển đa kịch bản</td>
                  <td>Châu Âu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="popup-footer">
          <span class="popup-hint-scroll">Cuộn xuống tiếp để kết nối tư vấn chuyên sâu ↓</span>
        </div>
      `;

      return card;
    }
  };
}

