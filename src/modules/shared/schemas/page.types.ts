export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export type BlockType =
  | 'hero-video'
  | 'hero-3d'
  | 'image'
  | 'text'
  | 'video'
  | 'gallery'
  | 'model-3d'
  | 'map'
  | 'specifications'
  | 'comparison'
  | 'info-card'
  | 'container';

export type SectionType =
  | 'full-screen'
  | 'half-screen'
  | 'custom'
  | 'hero-video'
  | 'hero-3d'
  | 'sticky';

export interface BlockLayoutConfig {
  position?: 'relative' | 'absolute' | 'fixed';
  x?: string; // e.g. "50%", "20px", "center", "left", "right"
  y?: string; // e.g. "100px", "top", "center", "bottom"
  width: string; // e.g. "480px", "90%", "60vw"
  height: string; // e.g. "auto", "520px", "80vh"
  minWidth?: string;
  maxWidth?: string;
  aspectRatio?: string;
  zIndex?: number;
}

export interface BlockBorderRadiusIndividual {
  topLeft?: string;
  topRight?: string;
  bottomRight?: string;
  bottomLeft?: string;
}

export type ShadowPreset =
  | 'none'
  | 'editorial'
  | 'soft-ambient'
  | 'deep-floating'
  | 'dramatic'
  | 'glow-cyan'
  | 'custom';

export interface BlockTransformConfig {
  rotate?: number; // degrees, e.g. -5, 12
  scale?: number; // e.g. 1.0, 1.05
  scaleX?: number;
  scaleY?: number;
  translateX?: string;
  translateY?: string;
}

export interface BlockStyleConfig {
  background?: string; // e.g. "rgba(18, 20, 26, 0.85)"
  backdropBlur?: string; // e.g. "16px"
  borderRadius?: string; // e.g. "18px"
  borderRadiusIndividual?: BlockBorderRadiusIndividual;
  border?: string; // e.g. "1px solid rgba(255, 255, 255, 0.12)"
  shadow?: string; // e.g. "0 24px 48px rgba(0, 0, 0, 0.45)"
  shadowPreset?: ShadowPreset;
  opacity?: number; // 0.0 to 1.0
  padding?: string; // e.g. "24px"
  margin?: string;
  overflow?: 'visible' | 'hidden';
  hideHeader?: boolean; // Tắt tiêu đề của pop-up (chỉ hiện nội dung)
  transparentBackground?: boolean; // Loại bỏ khung nền pop-up (nền trong suốt)
}

export interface BlockAnimationConfig {
  entrance: 'fade-up' | 'fade-in' | 'scale-up' | 'slide-left' | 'slide-right' | 'none';
  scrollTrigger: 'enter' | 'center' | 'scroll-progress';
  duration: number; // in ms
  delay?: number; // in ms
  easing?: string;
  parallaxSpeed?: number; // Multi-speed parallax: -0.5 to +0.8
  parallaxDirection?: 'vertical' | 'horizontal';
  hoverZoom?: boolean;
}

export interface BlockResponsiveConfig {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  mobileLayout?: Partial<BlockLayoutConfig>;
  tabletLayout?: Partial<BlockLayoutConfig>;
}

export interface PopupBlockSchema<TContent = any> {
  id: string;
  type: BlockType;
  order: number;
  enabled: boolean;
  locked?: boolean;
  title: string;
  layout: BlockLayoutConfig;
  transform?: BlockTransformConfig;
  styling: BlockStyleConfig;
  animation: BlockAnimationConfig;
  responsive: BlockResponsiveConfig;
  content: TContent;
  children?: PopupBlockSchema[];
}

export interface SectionLayoutConfig {
  height: string; // e.g. "100vh", "650px", "auto"
  minHeight?: string;
  width?: string; // e.g. "100%", "1440px", "1200px", "90%"
  maxWidth?: string; // e.g. "1440px", "1600px", "none"
  background?: string;
  sticky?: boolean;
  parallax?: boolean;
  scrollHandover?: boolean; // For hero scrub video/3D to release wheel when finished
}

export interface SectionSchema {
  id: string;
  type: SectionType;
  order: number;
  enabled: boolean;
  title: string;
  layout: SectionLayoutConfig;
  blocks: PopupBlockSchema[];
}

export interface PageSettings {
  primaryColor: string;
  fontFamily: string;
  enableSmoothScroll: boolean;
  preferReducedMotion: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface PageSchema {
  id: string;
  title: string;
  schemaVersion: '2.0.0';
  version: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  settings: PageSettings;
  sections: SectionSchema[];
}

export interface MediaAssetSchema {
  id: string;
  name: string;
  type: 'image' | 'video' | 'model' | 'document';
  mimeType: string;
  size: number;
  url: string; // Object URL or static URL
  thumbnailUrl?: string;
  createdAt: string;
  width?: number;
  height?: number;
  duration?: number;
}

