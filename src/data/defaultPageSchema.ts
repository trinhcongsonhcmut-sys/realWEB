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
    fontFamily: "'Be Vietnam Pro', sans-serif",
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
        // 1. Pop-up ảnh lớn trung tâm (Hero Visual)
        {
          id: 'blk-img-hero',
          type: 'image',
          order: 1,
          enabled: true,
          title: 'Tuyệt Tác Kiến Trúc Toàn Cảnh',
          layout: {
            width: '640px',
            height: '460px',
            position: 'absolute',
            x: '120px',
            y: '90px',
            zIndex: 10
          },
          transform: {
            rotate: -1,
            scale: 1.0
          },
          styling: {
            background: 'rgba(15, 20, 30, 0.85)',
            backdropBlur: '20px',
            borderRadius: '24px',
            borderRadiusIndividual: {
              topLeft: '28px',
              topRight: '12px',
              bottomRight: '36px',
              bottomLeft: '16px'
            },
            border: '1px solid rgba(255, 255, 255, 0.12)',
            shadowPreset: 'editorial',
            shadow: '0 32px 70px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            padding: '12px',
            overflow: 'visible'
          },
          animation: {
            entrance: 'fade-up',
            scrollTrigger: 'center',
            duration: 700,
            parallaxSpeed: 0.05
          },
          responsive: {},
          content: {
            imageUrl: '/assets/frames/frame_0000.webp',
            alt: 'Toàn cảnh Landmark',
            caption: 'Khối tháp chính giữa công viên đồi và mặt hồ sinh thái',
            badge: 'KIẾN TRÚC TRUNG TÂM',
            sizeType: 'large'
          }
        },

        // 2. Pop-up ảnh vệ tinh 1: Lệch góc trên trái (Top-Left)
        {
          id: 'blk-img-sat-1',
          type: 'image',
          order: 2,
          enabled: true,
          title: 'Góc Cận Cảnh Không Gian',
          layout: {
            width: '260px',
            height: 'auto',
            position: 'absolute',
            x: '40px',
            y: '30px',
            zIndex: 8
          },
          transform: {
            rotate: -3.5,
            scale: 1.0
          },
          styling: {
            background: 'rgba(18, 22, 34, 0.88)',
            backdropBlur: '16px',
            borderRadius: '18px',
            borderRadiusIndividual: {
              topLeft: '24px',
              topRight: '24px',
              bottomRight: '12px',
              bottomLeft: '12px'
            },
            border: '1px solid rgba(255, 255, 255, 0.1)',
            shadowPreset: 'soft-ambient',
            shadow: '0 20px 45px -10px rgba(0, 0, 0, 0.6)',
            padding: '10px'
          },
          animation: {
            entrance: 'fade-in',
            scrollTrigger: 'center',
            duration: 600,
            delay: 100,
            parallaxSpeed: -0.14
          },
          responsive: {},
          content: {
            imageUrl: '/assets/frames/frame_0060.webp',
            alt: 'Vật liệu tự nhiên',
            caption: 'Đá cẩm thạch Ý & lam nhôm anodized cao cấp',
            badge: 'CHI TIẾT VẬT LIỆU',
            sizeType: 'small'
          }
        },

        // 3. Pop-up ảnh vệ tinh 2: Lệch góc trên phải (Top-Right)
        {
          id: 'blk-img-sat-2',
          type: 'image',
          order: 3,
          enabled: true,
          title: 'Tầm Nhìn Hoàng Hôn Skyline',
          layout: {
            width: '280px',
            height: 'auto',
            position: 'absolute',
            x: '860px',
            y: '50px',
            zIndex: 15
          },
          transform: {
            rotate: 2.5,
            scale: 1.0
          },
          styling: {
            background: 'rgba(18, 22, 34, 0.88)',
            backdropBlur: '16px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            shadowPreset: 'deep-floating',
            shadow: '0 28px 55px -10px rgba(0, 0, 0, 0.75)',
            padding: '10px'
          },
          animation: {
            entrance: 'scale-up',
            scrollTrigger: 'center',
            duration: 650,
            delay: 200,
            parallaxSpeed: 0.16
          },
          responsive: {},
          content: {
            imageUrl: '/assets/frames/frame_0120.webp',
            alt: 'Hoàng hôn đường chân trời',
            caption: 'Skyline rực rỡ từ ban công kính vô cực',
            badge: 'SKYLINE VIEW',
            sizeType: 'small'
          }
        },

        // 4. Pop-up ảnh vệ tinh 3: Lệch góc dưới phải (Bottom-Right)
        {
          id: 'blk-img-sat-3',
          type: 'image',
          order: 4,
          enabled: true,
          title: 'Hồ Bơi Vô Cực Chân Mây',
          layout: {
            width: '310px',
            height: 'auto',
            position: 'absolute',
            x: '820px',
            y: '440px',
            zIndex: 12
          },
          transform: {
            rotate: -2,
            scale: 1.0
          },
          styling: {
            background: 'rgba(18, 22, 34, 0.88)',
            backdropBlur: '18px',
            borderRadius: '22px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            shadowPreset: 'editorial',
            shadow: '0 32px 70px -15px rgba(0, 0, 0, 0.7)',
            padding: '10px'
          },
          animation: {
            entrance: 'fade-up',
            scrollTrigger: 'center',
            duration: 700,
            delay: 350,
            parallaxSpeed: -0.09
          },
          responsive: {},
          content: {
            imageUrl: '/assets/frames/frame_0180.webp',
            alt: 'Hồ bơi vô cực',
            caption: 'Làn nước phẳng lặng kết nối trực tiếp với chân trời',
            badge: 'TIỆN ÍCH NGOẠI KHU',
            sizeType: 'small'
          }
        },

        // 5. Pop-up thông tin BĐS chồng đè (Overlapping Information Card)
        {
          id: 'blk-info-card-1',
          type: 'info-card',
          order: 5,
          enabled: true,
          title: 'Thông Số Biệt Thự Horizon',
          layout: {
            width: '390px',
            height: 'auto',
            position: 'absolute',
            x: '540px',
            y: '210px',
            zIndex: 35
          },
          transform: {
            rotate: 1,
            scale: 1.0
          },
          styling: {
            background: 'rgba(15, 20, 32, 0.94)',
            backdropBlur: '24px',
            borderRadius: '24px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            shadowPreset: 'deep-floating',
            shadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 25px rgba(56, 189, 248, 0.15)',
            padding: '22px'
          },
          animation: {
            entrance: 'slide-right',
            scrollTrigger: 'center',
            duration: 600,
            delay: 250,
            parallaxSpeed: 0.26
          },
          responsive: {},
          content: {
            tagline: 'THE SKY HORIZON • PRIVATE SUITE',
            title: 'Penthouse Panorama 360',
            description: 'Bố cục mở phi đối xứng tối ưu ánh sáng tự nhiên với trần cao thông tầng 7.2m và hệ vách kính cong không khung viền.',
            price: '38.5 TỶ VNĐ',
            metrics: [
              { label: 'DIỆN TÍCH', value: '428 m²' },
              { label: 'TẦM NHÌN', value: '360° Panorama' },
              { label: 'PHÒNG NGỦ', value: '4 Master' },
              { label: 'HỒ BƠI', value: 'Riêng tư' }
            ],
            ctaText: 'Đăng Ký Tư Vấn Ngay',
            ctaLink: '#contact'
          }
        },

        // 6. Pop-up văn bản trích dẫn phong cách sống (Editorial Text Card)
        {
          id: 'blk-text-quote',
          type: 'text',
          order: 6,
          enabled: true,
          title: 'Triết Lý Thiết Kế',
          layout: {
            width: '330px',
            height: 'auto',
            position: 'absolute',
            x: '180px',
            y: '400px',
            zIndex: 28
          },
          transform: {
            rotate: -1.5,
            scale: 1.0
          },
          styling: {
            background: 'rgba(20, 25, 38, 0.92)',
            backdropBlur: '20px',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            shadowPreset: 'soft-ambient',
            shadow: '0 20px 45px -10px rgba(0, 0, 0, 0.6)',
            padding: '20px'
          },
          animation: {
            entrance: 'fade-up',
            scrollTrigger: 'center',
            duration: 650,
            delay: 300,
            parallaxSpeed: 0.18
          },
          responsive: {},
          content: {
            text: '“Kiến trúc đỉnh cao không áp đặt tự nhiên, mà tạo ra sự giao thoa mềm mại giữa nghệ thuật thị giác và trải nghiệm xúc cảm sống động.”',
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontSize: '15px',
            fontWeight: '400',
            fontStyle: 'italic',
            textAlign: 'justify',
            textColor: '#e2e8f0',
            lineHeight: '1.8'
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

