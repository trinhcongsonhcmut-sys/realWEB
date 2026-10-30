/**
 * Types definition for Scalable Popup System (AURA SCROLL / RenderAHouse inspired)
 */

export type PopupSize = 'large' | 'medium' | 'small';
export type PopupCategory = 'overview' | 'upload' | 'specs' | 'gallery' | 'contact' | 'custom';

export interface PopupItem {
  id: string;
  size: PopupSize;
  category: PopupCategory;
  badge?: string;
  title: string;
  subtitle?: string;
  order: number;
  render: (manager: any) => HTMLElement;
}

export interface UploadedMediaItem {
  id: string;
  file: File;
  name: string;
  sizeMB: string;
  type: 'image' | 'video' | 'pdf' | 'model';
  previewUrl: string;
  timestamp: string;
  caption: string;
}

export interface PopupEventMap {
  'popup:enter': (popupId: string) => void;
  'popup:leave': (popupId: string) => void;
  'popup:upload': (item: UploadedMediaItem) => void;
  'popup:action': (action: string, data?: any) => void;
}

