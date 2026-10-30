import { MediaAssetSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { IndexedDBMediaStore } from './IndexedDBMediaStore';

const MEDIA_META_KEY = 'realweb_media_metadata_list';

export class MediaManagerService {
  private static instance: MediaManagerService;
  private blobStore: IndexedDBMediaStore;
  private emitter: EventEmitter;
  private assets: MediaAssetSchema[] = [];
  private activeUrls: Map<string, string> = new Map(); // assetId -> ObjectURL

  private constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    this.blobStore = new IndexedDBMediaStore();
    this.loadMetadata();
    this.seedDefaultAssets();
  }

  public static getInstance(emitter: EventEmitter): MediaManagerService {
    if (!MediaManagerService.instance) {
      MediaManagerService.instance = new MediaManagerService(emitter);
    }
    return MediaManagerService.instance;
  }

  private loadMetadata(): void {
    try {
      const raw = localStorage.getItem(MEDIA_META_KEY);
      if (raw) {
        this.assets = JSON.parse(raw);
      }
    } catch {
      this.assets = [];
    }
  }

  private saveMetadata(): void {
    try {
      localStorage.setItem(MEDIA_META_KEY, JSON.stringify(this.assets));
      this.emitter.emit('media:updated', this.assets);
    } catch (e) {
      console.error('Failed to save media metadata:', e);
    }
  }

  private seedDefaultAssets(): void {
    // Check if defaults exist, otherwise add them
    const defaults: MediaAssetSchema[] = [
      {
        id: 'asset-video-1',
        name: 'video_1.mp4 (Toàn cảnh & Mặt tiền Dubai Luxury)',
        type: 'video',
        mimeType: 'video/mp4',
        size: 20600000,
        url: '/assets/videos/video_1.mp4',
        createdAt: '2026-10-30T00:00:00.000Z'
      },
      {
        id: 'asset-model-livingroom',
        name: 'livingroom_wabisabi_mix.glb (Phòng khách Wabi-Sabi 3D)',
        type: 'model',
        mimeType: 'model/gltf-binary',
        size: 15400000,
        url: '/assets/houses/custom-room/livingroom_wabisabi_mix.glb',
        createdAt: '2026-10-30T00:00:00.000Z'
      },
      {
        id: 'asset-frame-cover',
        name: 'frame_0000.webp (Ảnh bìa khởi đầu)',
        type: 'image',
        mimeType: 'image/webp',
        size: 98000,
        url: '/assets/frames/frame_0000.webp',
        createdAt: '2026-10-30T00:00:00.000Z'
      }
    ];

    let changed = false;
    defaults.forEach((def) => {
      if (!this.assets.some((a) => a.id === def.id || a.url === def.url)) {
        this.assets.unshift(def);
        changed = true;
      }
    });

    if (changed) {
      this.saveMetadata();
    }
  }

  public getAssets(typeFilter?: 'image' | 'video' | 'model' | 'document'): MediaAssetSchema[] {
    if (!typeFilter) return [...this.assets];
    return this.assets.filter((a) => a.type === typeFilter);
  }

  public getAssetById(id: string): MediaAssetSchema | undefined {
    return this.assets.find((a) => a.id === id);
  }

  public async uploadFile(file: File): Promise<MediaAssetSchema> {
    const id = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let type: 'image' | 'video' | 'model' | 'document' = 'image';

    if (file.type.startsWith('video/')) {
      type = 'video';
    } else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
      type = 'model';
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      type = 'document';
    }

    // Save binary data in IndexedDB
    await this.blobStore.saveBlob(id, file);

    // Create session URL
    const objectUrl = URL.createObjectURL(file);
    this.activeUrls.set(id, objectUrl);

    const asset: MediaAssetSchema = {
      id,
      name: file.name,
      type,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      url: objectUrl,
      createdAt: new Date().toISOString()
    };

    this.assets.unshift(asset);
    this.saveMetadata();
    return asset;
  }

  public async resolveAssetUrl(asset: MediaAssetSchema): Promise<string> {
    if (asset.url.startsWith('/') || asset.url.startsWith('http')) {
      return asset.url;
    }
    if (this.activeUrls.has(asset.id)) {
      return this.activeUrls.get(asset.id)!;
    }
    // Attempt load from IndexedDB
    const blob = await this.blobStore.getBlob(asset.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      this.activeUrls.set(asset.id, url);
      return url;
    }
    return asset.url;
  }

  public renameAsset(id: string, newName: string): boolean {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return false;
    asset.name = newName;
    this.saveMetadata();
    return true;
  }

  public async deleteAsset(id: string): Promise<boolean> {
    const index = this.assets.findIndex((a) => a.id === id);
    if (index === -1) return false;

    // Release object url
    if (this.activeUrls.has(id)) {
      URL.revokeObjectURL(this.activeUrls.get(id)!);
      this.activeUrls.delete(id);
    }

    await this.blobStore.deleteBlob(id);
    this.assets.splice(index, 1);
    this.saveMetadata();
    return true;
  }
}

