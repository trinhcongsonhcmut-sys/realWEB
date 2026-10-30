/**
 * ContactActionPopup.ts
 * Action popup for project inquiries, private tour bookings, or architectural partnership requests.
 */

import { PopupItem } from '../types';

export function createContactActionPopup(): PopupItem {
  return {
    id: 'popup-contact-action',
    size: 'small',
    category: 'contact',
    badge: 'DIRECT CONSULTATION',
    title: 'Đặt Lịch Trải Nghiệm Thực Tế',
    subtitle: 'Nhận trọn bộ hồ sơ bản vẽ 4K và tư vấn thiết kế chuyên sâu',
    order: 4,
    render: () => {
      const card = document.createElement('div');
      card.className = 'popup-card popup-card-small popup-card-contact';

      card.innerHTML = `
        <div class="popup-header">
          <div class="popup-badge-group">
            <span class="popup-badge badge-contact">VIP INQUIRY</span>
            <span class="popup-badge badge-step">BƯỚC 4 / 4</span>
          </div>
          <h2 class="popup-title">Liên Hệ Trải Nghiệm & Hợp Tác</h2>
          <p class="popup-desc">Để lại thông tin để kiến trúc sư trưởng gửi bộ tài liệu concept 4K và đặt lịch tham quan thực địa.</p>
        </div>

        <div class="popup-body">
          <form class="contact-quick-form" id="contact-inquiry-form" onsubmit="return false;">
            <div class="form-group">
              <label for="contact-fullname">Họ và tên của bạn:</label>
              <input type="text" id="contact-fullname" class="popup-input" required placeholder="Nguyễn Văn A" />
            </div>
            <div class="form-group">
              <label for="contact-phone">Số điện thoại / Zalo:</label>
              <input type="tel" id="contact-phone" class="popup-input" required placeholder="0908 xxx xxx" />
            </div>
            <div class="form-group">
              <label for="contact-interest">Nhu cầu quan tâm chính:</label>
              <select id="contact-interest" class="popup-select">
                <option value="buy">Mua để an cư & đầu tư</option>
                <option value="custom-design">Đặt hàng thiết kế theo ý tưởng riêng</option>
                <option value="3d-rendering">Dịch vụ dựng phối cảnh & diễn họa video 3D</option>
              </select>
            </div>
            <button type="submit" class="btn-popup-submit" id="btn-submit-inquiry">
              Gửi Yêu Cầu Tư Vấn Ngay
            </button>
          </form>
          <div class="contact-success-msg hidden" id="contact-success-box">
            <div class="success-icon">✓</div>
            <h4>Yêu cầu đã được gửi thành công!</h4>
            <p>Đội ngũ kiến trúc sư sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
          </div>
        </div>

        <div class="popup-footer">
          <button class="btn-scroll-top-hero" id="btn-back-to-video-top">
            ↑ Lăn ngược lên để xem lại video chuyển động
          </button>
        </div>
      `;

      const form = card.querySelector('#contact-inquiry-form') as HTMLFormElement;
      const successBox = card.querySelector('#contact-success-box') as HTMLElement;
      const submitBtn = card.querySelector('#btn-submit-inquiry') as HTMLElement;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.classList.add('hidden');
        successBox.classList.remove('hidden');
      });

      return card;
    }
  };
}

