import { PageSchema } from '../modules/shared/schemas/page.types';

export const DEFAULT_PAGE_SCHEMA: PageSchema = {
  id: 'realweb-showcase-page-01',
  title: 'The Sky Horizon Landmark & Luxury Living',
  schemaVersion: '2.0.0',
  version: 1,
  status: 'published',
  createdAt: '2026-10-30T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  settings: {
    primaryColor: '#38bdf8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    enableSmoothScroll: true,
    preferReducedMotion: false,
    seoTitle: 'The Sky Horizon Landmark - Trang Giới Thiệu Bất Động Sản 3D Đỉnh Cao',
    seoDescription: 'Trải nghiệm cuộn dọc video mượt mà và khám phá mô hình không gian 3D tương tác.'
  },
  sections: [
    // 1. Hero Video Section (Video scrub 15 stages)
    {
      id: 'sec-hero-video',
      type: 'hero-video',
      order: 1,
      enabled: true,
      title: '1. Toàn Cảnh Dự Án (Hero Video Scroller)',
      layout: {
        height: '100vh',
        background: '#0a0d14',
        scrollHandover: true
      },
      blocks: [
        {
          id: 'blk-hero-vid-main',
          type: 'hero-video',
          order: 1,
          enabled: true,
          title: 'Hành Trình Flycam Tiếp Cận',
          layout: {
            width: '100%',
            height: '100vh',
            position: 'relative'
          },
          styling: {
            opacity: 1
          },
          animation: {
            entrance: 'none',
            scrollTrigger: 'enter',
            duration: 0
          },
          responsive: {},
          content: {
            manifestUrl: '/assets/frames/manifest.json',
            totalFrames: 298,
            fps: 60,
            title: 'The Sky Horizon Landmark'
          }
        }
      ]
    },

    // 2. Pop-up Ảnh Lớn, Văn Bản & Ảnh Nhỏ
    {
      id: 'sec-architecture-popups',
      type: 'full-screen',
      order: 2,
      enabled: true,
      title: '2. Chi Tiết Kiến Trúc & Pop-up Đa Tầng',
      layout: {
        height: '100vh',
        background: 'linear-gradient(180deg, #0a0d14 0%, #111520 100%)',
        parallax: true
      },
      blocks: [
        // Pop-up ảnh lớn
        {
          id: 'blk-img-large',
          type: 'image',
          order: 1,
          enabled: true,
          title: 'Phối Cảnh Toàn Cảnh',
          layout: {
            width: '520px',
            height: 'auto',
            position: 'absolute',
            x: '80px',
            y: '100px',
            zIndex: 10
          },
          styling: {
            background: 'rgba(18, 22, 32, 0.9)',
            backdropBlur: '20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            shadow: '0 30px 60px rgba(0, 0, 0, 0.6)',
            padding: '16px'
          },
          animation: {
            entrance: 'fade-up',
            scrollTrigger: 'center',
            duration: 500
          },
          responsive: {},
          content: {
            imageUrl: '/assets/frames/frame_0000.webp',
            alt: 'Toàn cảnh Landmark',
            caption: 'Góc nhìn từ trên cao bao trọn hồ cảnh quan và quảng trường',
            badge: 'ẢNH LỚN',
            sizeType: 'large'
          }
        },
        // Pop-up văn bản
        {
          id: 'blk-text-intro',
          type: 'text',
          order: 2,
          enabled: true,
          title: 'Thông Tin Dự Án',
          layout: {
            width: '460px',
            height: 'auto',
            position: 'absolute',
            x: '640px',
            y: '120px',
            zIndex: 20
          },
          styling: {
            background: 'rgba(22, 27, 39, 0.92)',
            backdropBlur: '24px',
            borderRadius: '20px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            shadow: '0 30px 60px rgba(0, 0, 0, 0.65)',
            padding: '24px'
          },
          animation: {
            entrance: 'slide-right',
            scrollTrigger: 'center',
            duration: 600,
            delay: 150
          },
          responsive: {},
          content: {
            tagline: 'KIẾN TRÚC BIỂU TƯỢNG',
            headline: 'The Sky Horizon Landmark',
            description: 'Tọa lạc tại tâm điểm phồn hoa, công trình hội tụ các giá trị kiến trúc tinh tế nhất cùng hệ sinh thái tiện ích chuẩn quốc tế.',
            bulletPoints: [
              'Tầm nhìn panorama 360 độ ngắm hồ trung tâm',
              'Vật liệu kính Low-E 3 lớp cách nhiệt tiêu chuẩn Châu Âu',
              'Sảnh đón 5 sao với tiếp tân & an ninh thông minh 24/7'
            ],
            ctaText: 'Đăng Ký Tham Quan Căn Hộ Mẫu',
            ctaLink: '#contact'
          }
        },
        // Pop-up ảnh nhỏ
        {
          id: 'blk-img-small',
          type: 'image',
          order: 3,
          enabled: true,
          title: 'Chi Tiết Mặt Tiền',
          layout: {
            width: '280px',
            height: 'auto',
            position: 'absolute',
            x: '640px',
            y: '480px',
            zIndex: 30
          },
          styling: {
            background: 'rgba(15, 18, 26, 0.92)',
            backdropBlur: '18px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            shadow: '0 20px 40px rgba(0, 0, 0, 0.55)',
            padding: '12px'
          },
          animation: {
            entrance: 'scale-up',
            scrollTrigger: 'center',
            duration: 450,
            delay: 300
          },
          responsive: {},
          content: {
            imageUrl: '/assets/frames/frame_0060.webp',
            alt: 'Chi tiết mặt tiền',
            caption: 'Góc cận cảnh đường nét hoàn thiện',
            badge: 'CHI TIẾT',
            sizeType: 'small'
          }
        }
      ]
    },

    // 3. Gallery Đa Ảnh & Video Section
    {
      id: 'sec-gallery-video',
      type: 'full-screen',
      order: 3,
      enabled: true,
      title: '3. Bộ Sưu Tập & Video Thuyết Minh',
      layout: {
        height: '100vh',
        background: '#0d1017'
      },
      blocks: [
        // Gallery block
        {
          id: 'blk-gallery-main',
          type: 'gallery',
          order: 1,
          enabled: true,
          title: 'Bộ Sưu Tập Hình Ảnh Dự Án',
          layout: {
            width: '560px',
            height: 'auto',
            position: 'absolute',
            x: '60px',
            y: '100px',
            zIndex: 15
          },
          styling: {
            background: 'rgba(20, 24, 34, 0.9)',
            backdropBlur: '20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '20px'
          },
          animation: {
            entrance: 'fade-up',
            scrollTrigger: 'enter',
            duration: 500
          },
          responsive: {},
          content: {
            items: [
              { url: '/assets/frames/frame_0000.webp', title: 'Toàn cảnh ban ngày nhìn từ trên cao' },
              { url: '/assets/frames/frame_0045.webp', title: 'Góc nghiêng tiếp cận phân khu thương mại' },
              { url: '/assets/frames/frame_0090.webp', title: 'Chính diện mặt tiền đài phun nước' },
              { url: '/assets/frames/frame_0180.webp', title: 'Tiền sảnh đón tiếp sang trọng' }
            ]
          }
        },
        // Video Section
        {
          id: 'blk-video-spotlight',
          type: 'video',
          order: 2,
          enabled: true,
          title: 'Video Thuyết Minh Toàn Cảnh',
          layout: {
            width: '540px',
            height: 'auto',
            position: 'absolute',
            x: '660px',
            y: '100px',
            zIndex: 15
          },
          styling: {
            background: 'rgba(20, 24, 34, 0.9)',
            backdropBlur: '20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '20px'
          },
          animation: {
            entrance: 'fade-up',
            scrollTrigger: 'enter',
            duration: 500,
            delay: 150
          },
          responsive: {},
          content: {
            videoUrl: '/assets/videos/video_1.mp4',
            posterUrl: '/assets/frames/frame_0000.webp',
            autoplay: false,
            loop: true,
            muted: true,
            caption: 'Video flycam 4K ghi lại hành trình tiếp cận dự án thực tế'
          }
        }
      ]
    },

    // 4. Section GLB Viewer 3D Tương Tác
    {
      id: 'sec-glb-viewer',
      type: 'hero-3d',
      order: 4,
      enabled: true,
      title: '4. Khám Phá Không Gian 3D (GLB Viewer)',
      layout: {
        height: '100vh',
        background: '#090b10'
      },
      blocks: [
        {
          id: 'blk-hero-3d-main',
          type: 'hero-3d',
          order: 1,
          enabled: true,
          title: 'Không Gian Nội Thất 3D Realtime',
          layout: {
            width: '100%',
            height: '100vh',
            position: 'relative'
          },
          styling: {
            opacity: 1
          },
          animation: {
            entrance: 'none',
            scrollTrigger: 'enter',
            duration: 0
          },
          responsive: {},
          content: {
            modelUrl: '/assets/houses/custom-room/livingroom_wabisabi_mix.glb',
            enableWalkthrough: true
          }
        }
      ]
    },

    // 5. Section Thông Số Bất Động Sản & Vị Trí
    {
      id: 'sec-specifications-map',
      type: 'full-screen',
      order: 5,
      enabled: true,
      title: '5. Thông Số Bất Động Sản & Vị Trí',
      layout: {
        height: '100vh',
        background: 'linear-gradient(180deg, #090b10 0%, #030407 100%)'
      },
      blocks: [
        // Thông số kỹ thuật
        {
          id: 'blk-specs-table',
          type: 'specifications',
          order: 1,
          enabled: true,
          title: 'Thông Số Kỹ Thuật Dự Án',
          layout: {
            width: '480px',
            height: 'auto',
            position: 'absolute',
            x: '80px',
            y: '100px',
            zIndex: 10
          },
          styling: {
            background: 'rgba(20, 24, 34, 0.92)',
            backdropBlur: '20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '24px'
          },
          animation: {
            entrance: 'slide-left',
            scrollTrigger: 'enter',
            duration: 500
          },
          responsive: {},
          content: {
            priceDisplay: '15.5 Tỷ VNĐ',
            specs: [
              { label: 'Diện tích đất', value: '90 m² (4.5m x 20m)' },
              { label: 'Diện tích sử dụng', value: '260 m² (3 tầng sàn)' },
              { label: 'Phòng ngủ / WC', value: '4 Phòng ngủ / 4 WC riêng' },
              { label: 'Hướng nhà', value: 'Đông Nam (Đón gió mát)' },
              { label: 'Tình trạng pháp lý', value: 'Sổ hồng riêng - Sang tên ngay' },
              { label: 'Tiêu chuẩn bàn giao', value: 'Hoàn thiện nội thất cao cấp' },
              { label: 'Thời gian bàn giao', value: 'Quý IV / 2026' }
            ]
          }
        },
        // Vị trí & Tiện ích
        {
          id: 'blk-map-amenities',
          type: 'map',
          order: 2,
          enabled: true,
          title: 'Vị Trí & Tiện Ích Xung Quanh',
          layout: {
            width: '440px',
            height: 'auto',
            position: 'absolute',
            x: '600px',
            y: '100px',
            zIndex: 10
          },
          styling: {
            background: 'rgba(20, 24, 34, 0.92)',
            backdropBlur: '20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '24px'
          },
          animation: {
            entrance: 'fade-up',
            scrollTrigger: 'enter',
            duration: 500,
            delay: 150
          },
          responsive: {},
          content: {
            address: 'Đại Lộ Ánh Dương, Khu Đô Thị Mới, TP. Hồ Chí Minh',
            amenities: [
              { icon: 'shopping-bag', name: 'TTTM Vincom Mega Mall', distance: '350m (3 phút đi bộ)' },
              { icon: 'activity', name: 'Bệnh Viện Đa Khoa Quốc Tế', distance: '1.2km (5 phút)' },
              { icon: 'book', name: 'Trường Liên Cấp Chuẩn Anh BIS', distance: '800m (4 phút)' },
              { icon: 'coffee', name: 'Phố Đi Bộ & Bến Du Thuyền', distance: '500m (5 phút đi bộ)' }
            ]
          }
        },
        // So sánh Trước / Sau
        {
          id: 'blk-comp-design',
          type: 'comparison',
          order: 3,
          enabled: true,
          title: 'So Sánh Hiện Trạng & Phối Cảnh',
          layout: {
            width: '440px',
            height: 'auto',
            position: 'absolute',
            x: '600px',
            y: '360px',
            zIndex: 10
          },
          styling: {
            background: 'rgba(20, 24, 34, 0.92)',
            backdropBlur: '20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '20px'
          },
          animation: {
            entrance: 'slide-right',
            scrollTrigger: 'enter',
            duration: 500,
            delay: 250
          },
          responsive: {},
          content: {
            beforeImage: '/assets/frames/frame_0000.webp',
            afterImage: '/assets/frames/frame_0060.webp',
            beforeLabel: 'Góc xa',
            afterLabel: 'Cận cảnh'
          }
        }
      ]
    }
  ]
};

