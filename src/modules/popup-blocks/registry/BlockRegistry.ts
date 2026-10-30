import { BaseBlock } from '../base/BaseBlock';
import { BlockType, PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';

import { HeroVideoBlock } from '../blocks/HeroVideoBlock';
import { Hero3DBlock } from '../blocks/Hero3DBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { TextBlock } from '../blocks/TextBlock';
import { VideoBlock } from '../blocks/VideoBlock';
import { GalleryBlock } from '../blocks/GalleryBlock';
import { Model3DBlock } from '../blocks/Model3DBlock';
import { MapBlock } from '../blocks/MapBlock';
import { SpecificationsBlock } from '../blocks/SpecificationsBlock';
import { ComparisonBlock } from '../blocks/ComparisonBlock';

export interface BlockMetadata {
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  defaultContent: any;
  defaultLayout: any;
}

export type BlockFactory = (schema: PopupBlockSchema, emitter: EventEmitter) => BaseBlock;

export class BlockRegistry {
  private static instance: BlockRegistry;
  private factories: Map<BlockType, BlockFactory> = new Map();
  private metadataList: Map<BlockType, BlockMetadata> = new Map();
  private isInitialized: boolean = false;

  private constructor() {
    this.initDefaultBlocks();
  }

  public static getInstance(): BlockRegistry {
    if (!BlockRegistry.instance) {
      BlockRegistry.instance = new BlockRegistry();
    }
    return BlockRegistry.instance;
  }

  public register(type: BlockType, factory: BlockFactory, metadata: BlockMetadata): void {
    this.factories.set(type, factory);
    this.metadataList.set(type, metadata);
  }

  public create(schema: PopupBlockSchema, emitter: EventEmitter): BaseBlock {
    const factory = this.factories.get(schema.type);
    if (!factory) {
      throw new Error(`Block type "${schema.type}" is not registered in BlockRegistry.`);
    }
    return factory(schema, emitter);
  }

  public getAvailableTypes(): BlockMetadata[] {
    return Array.from(this.metadataList.values());
  }

  public getMetadata(type: BlockType): BlockMetadata | undefined {
    return this.metadataList.get(type);
  }

  public initDefaultBlocks(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.register(
      'image',
      (schema, emitter) => new ImageBlock(schema, emitter),
      {
        type: 'image',
        name: 'Pop-up Hình Ảnh (Image)',
        description: 'Pop-up ảnh lớn, vừa hoặc nhỏ có khung kính mờ, chú thích và kéo thả file đổi ảnh tức thì',
        icon: 'image',
        defaultContent: { imageUrl: '/assets/frames/frame_0000.webp', caption: 'Góc nhìn kiến trúc tiêu biểu', sizeType: 'medium' },
        defaultLayout: { width: '420px', height: 'auto', position: 'absolute', x: '100px', y: '100px', zIndex: 10 }
      }
    );

    this.register(
      'text',
      (schema, emitter) => new TextBlock(schema, emitter),
      {
        type: 'text',
        name: 'Pop-up Văn Bản (Text Box)',
        description: 'Khung văn bản tùy chỉnh nội dung, hỗ trợ nhập chữ trực tiếp, chỉnh phông chữ, cỡ chữ, kiểu dáng và màu sắc',
        icon: 'type',
        defaultContent: {
          text: 'Nhập nội dung văn bản của bạn tại đây...',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '18px',
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'left',
          textColor: '#ffffff',
          lineHeight: '1.6'
        },
        defaultLayout: { width: '440px', height: 'auto', position: 'absolute', x: '580px', y: '120px', zIndex: 12 }
      }
    );

    this.register(
      'gallery',
      (schema, emitter) => new GalleryBlock(schema, emitter),
      {
        type: 'gallery',
        name: 'Bộ Sưu Tập Ảnh (Gallery)',
        description: 'Thư viện ảnh nhiều góc chụp thực tế và bản vẽ phối cảnh kèm thumbnail chuyển đổi mượt mà',
        icon: 'layers',
        defaultContent: {
          items: [
            { url: '/assets/frames/frame_0000.webp', title: 'Toàn cảnh ban ngày nhìn từ trên cao' },
            { url: '/assets/frames/frame_0045.webp', title: 'Góc nghiêng tiếp cận phân khu thương mại' },
            { url: '/assets/frames/frame_0090.webp', title: 'Chính diện mặt tiền đài phun nước' },
            { url: '/assets/frames/frame_0180.webp', title: 'Tiền sảnh đón tiếp sang trọng' }
          ]
        },
        defaultLayout: { width: '560px', height: 'auto', position: 'absolute', x: '80px', y: '100px', zIndex: 15 }
      }
    );

    this.register(
      'video',
      (schema, emitter) => new VideoBlock(schema, emitter),
      {
        type: 'video',
        name: 'Pop-up / Section Video',
        description: 'Trình phát video clip thuyết minh chất lượng cao kèm nút điều khiển, poster và nút đổi video',
        icon: 'play-circle',
        defaultContent: { videoUrl: '/assets/videos/video_1.mp4', posterUrl: '/assets/frames/frame_0000.webp', caption: 'Video toàn cảnh dự án' },
        defaultLayout: { width: '540px', height: 'auto', position: 'absolute', x: '660px', y: '100px', zIndex: 15 }
      }
    );

    this.register(
      'specifications',
      (schema, emitter) => new SpecificationsBlock(schema, emitter),
      {
        type: 'specifications',
        name: 'Thông Số Bất Động Sản (Specs)',
        description: 'Bảng thông số chi tiết diện tích đất, diện tích sử dụng, số phòng, pháp lý, giá bán',
        icon: 'file-text',
        defaultContent: {
          priceDisplay: '15.5 Tỷ VNĐ',
          specs: [
            { label: 'Diện tích đất', value: '90 m² (4.5m x 20m)' },
            { label: 'Diện tích sử dụng', value: '260 m² (3 tầng sàn)' },
            { label: 'Phòng ngủ / WC', value: '4 Phòng ngủ / 4 WC riêng' },
            { label: 'Hướng nhà', value: 'Đông Nam (Đón gió mát)' },
            { label: 'Tình trạng pháp lý', value: 'Sổ hồng riêng - Sang tên ngay' },
            { label: 'Thời gian bàn giao', value: 'Quý IV / 2026' }
          ]
        },
        defaultLayout: { width: '480px', height: 'auto', position: 'absolute', x: '80px', y: '100px', zIndex: 10 }
      }
    );

    this.register(
      'map',
      (schema, emitter) => new MapBlock(schema, emitter),
      {
        type: 'map',
        name: 'Vị Trí & Tiện Ích Xung Quanh',
        description: 'Khối thông tin địa chỉ và khoảng cách kết nối các tiện ích trường học, bệnh viện, TTTM',
        icon: 'map-pin',
        defaultContent: {
          address: 'Đại Lộ Ánh Dương, Khu Đô Thị Mới, TP. Hồ Chí Minh',
          amenities: [
            { icon: 'shopping-bag', name: 'TTTM Vincom Mega Mall', distance: '350m (3 phút đi bộ)' },
            { icon: 'activity', name: 'Bệnh Viện Đa Khoa Quốc Tế', distance: '1.2km (5 phút)' },
            { icon: 'book', name: 'Trường Liên Cấp Chuẩn Anh BIS', distance: '800m (4 phút)' }
          ]
        },
        defaultLayout: { width: '440px', height: 'auto', position: 'absolute', x: '580px', y: '100px', zIndex: 10 }
      }
    );

    this.register(
      'comparison',
      (schema, emitter) => new ComparisonBlock(schema, emitter),
      {
        type: 'comparison',
        name: 'So Sánh Trước / Sau (Comparison)',
        description: 'Thanh trượt so sánh trực quan giữa hình ảnh thực tế và bản vẽ thiết kế phối cảnh 3D',
        icon: 'sliders',
        defaultContent: {
          beforeImage: '/assets/frames/frame_0000.webp',
          afterImage: '/assets/frames/frame_0060.webp',
          beforeLabel: 'Hiện trạng',
          afterLabel: 'Phối cảnh 3D'
        },
        defaultLayout: { width: '560px', height: 'auto', position: 'absolute', x: '200px', y: '120px', zIndex: 15 }
      }
    );

    this.register(
      'model-3d',
      (schema, emitter) => new Model3DBlock(schema, emitter),
      {
        type: 'model-3d',
        name: 'Vật Thể 3D Độc Lập (3D Object)',
        description: 'Khối hiển thị mô hình 3D xoay 360 độ cho chi tiết nội thất, sofa, tượng trang trí',
        icon: 'package',
        defaultContent: { modelUrl: '/assets/houses/custom-room/livingroom_wabisabi_mix.glb', label: 'Chi tiết nội thất' },
        defaultLayout: { width: '380px', height: 'auto', position: 'absolute', x: '580px', y: '320px', zIndex: 12 }
      }
    );

    this.register(
      'hero-video',
      (schema, emitter) => new HeroVideoBlock(schema, emitter),
      {
        type: 'hero-video',
        name: 'Hero Video Scroller (15 Stages)',
        description: 'Video scrub điều khiển bằng cuộn chuột với 15 mốc hành trình mượt mà',
        icon: 'video',
        defaultContent: { manifestUrl: '/assets/frames/manifest.json', totalFrames: 298, fps: 60 },
        defaultLayout: { width: '100%', height: '100vh', position: 'relative' }
      }
    );

    this.register(
      'hero-3d',
      (schema, emitter) => new Hero3DBlock(schema, emitter),
      {
        type: 'hero-3d',
        name: 'Hero 3D Walkthrough (GLB Viewer)',
        description: 'Trải nghiệm 3D tham quan nhà phố với waypoint graph và xoay 360 độ góc nhìn',
        icon: 'box',
        defaultContent: { modelUrl: '/assets/houses/custom-room/livingroom_wabisabi_mix.glb', enableWalkthrough: true },
        defaultLayout: { width: '100%', height: '100vh', position: 'relative' }
      }
    );
  }
}
