/**
 * ProjectOverviewPopup.ts
 * Large popup showcasing the architectural design concept, key metrics, and design philosophy.
 * Inspired by modern high-end architectural studio websites like RenderAHouse.
 */

import { PopupItem } from '../types';

export function createProjectOverviewPopup(): PopupItem {
  return {
    id: 'popup-project-overview',
    size: 'large',
    category: 'overview',
    badge: 'ARCHITECTURE SHOWCASE',
    title: 'Tổng Quan Dự Án & Phong Cách Kiến Trúc',
    subtitle: 'Khám phá sự giao thoa giữa ánh sáng tự nhiên và kiến trúc Wabi-Sabi đương đại',
    order: 1,
    render: () => {
      const card = document.createElement('div');
      card.className = 'popup-card popup-card-large popup-card-overview';

      card.innerHTML = `
        <div class="popup-header">
          <div class="popup-badge-group">
            <span class="popup-badge badge-concept">CONCEPT REVEAL</span>
            <span class="popup-badge badge-step">BƯỚC 1 / 4</span>
          </div>
          <h2 class="popup-title">AURA SKY RESIDENCE</h2>
          <p class="popup-desc">Tuyệt tác không gian sống giữa trung tâm đô thị, kết hợp sự tinh tế của chất liệu gỗ sồi tự nhiên với tầm nhìn khoáng đạt hướng hồ mặt tiền.</p>
        </div>

        <div class="popup-body">
          <div class="metrics-grid">
            <div class="metric-box">
              <span class="metric-val">380 m²</span>
              <span class="metric-lbl">Diện Tích Sử Dụng</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">4.2 m</span>
              <span class="metric-lbl">Chiều Cao Trần Thông Thủy</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">100%</span>
              <span class="metric-lbl">View Panorama Mặt Tiền</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">4K UHD</span>
              <span class="metric-lbl">Độ Sắc Nét Diễn Họa</span>
            </div>
          </div>

          <div class="design-highlights-section">
            <h3 class="section-title">Điểm Nhấn Kiến Trúc Nổi Bật</h3>
            <div class="highlights-row">
              <div class="highlight-card">
                <div class="highlight-num">01</div>
                <h4>Mặt Tiền & Khoảng Sân Tiền Sảnh</h4>
                <p>Hàng rào thép cắt CNC kết hợp bậc tam cấp đá phiến đen, đón dòng sinh khí tự nhiên từ trục đại lộ chính.</p>
              </div>
              <div class="highlight-card">
                <div class="highlight-num">02</div>
                <h4>Cửa Kính Khổ Lớn Hệ Slim</h4>
                <p>Hệ cửa kính Low-E 3 lớp tối ưu cách nhiệt, mở trọn tầm nhìn kết nối không gian sân trước với nội thất phòng khách.</p>
              </div>
              <div class="highlight-card">
                <div class="highlight-num">03</div>
                <h4>Nội Thất Gỗ Wabi-Sabi</h4>
                <p>Tông màu be - nâu ấm áp, kết hợp bề mặt gỗ sồi sấy kỹ thuật số cùng các đường cong mềm mại của hệ sofa bespoke.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="popup-footer">
          <span class="popup-hint-scroll">Cuộn xuống tiếp để mở khu vực Tải lên nội dung ↓</span>
        </div>
      `;

      return card;
    }
  };
}

