import * as THREE from 'three';

export class TextureLoaderService {
  private static instance: TextureLoaderService;
  private textureCache: Map<string, THREE.Texture> = new Map();
  private loader: THREE.TextureLoader = new THREE.TextureLoader();

  public static getInstance(): TextureLoaderService {
    if (!TextureLoaderService.instance) {
      TextureLoaderService.instance = new TextureLoaderService();
    }
    return TextureLoaderService.instance;
  }

  /**
   * Reads a user-uploaded image file from <input type="file"> and returns its DataURL
   */
  public readImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Tệp tải lên phải là hình ảnh (.jpg, .png, .webp)'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Không thể đọc nội dung tệp hình ảnh'));
        }
      };
      reader.onerror = () => reject(new Error('Lỗi trong quá trình đọc tệp'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Loads a THREE.Texture from a DataURL or URL string, with repeating wrap and sRGB color space
   */
  public loadTexture(url: string, repeatX: number = 1, repeatY: number = 1): Promise<THREE.Texture> {
    const cacheKey = `${url}_${repeatX}_${repeatY}`;
    if (this.textureCache.has(cacheKey)) {
      return Promise.resolve(this.textureCache.get(cacheKey)!);
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(repeatX, repeatY);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.needsUpdate = true;
          this.textureCache.set(cacheKey, texture);
          resolve(texture);
        },
        undefined,
        (err) => {
          console.error('[TextureLoaderService] Failed to load texture', err);
          reject(err);
        }
      );
    });
  }

  /**
   * Generates a realistic high-resolution procedural canvas texture (Ceramic, Wood, Marble, Fabric)
   * used for instant built-in materials without downloading external assets.
   */
  public createProceduralTexture(
    type: 'wood' | 'ceramic' | 'marble' | 'fabric',
    baseColor: string = '#c89d6d',
    repeatX: number = 4,
    repeatY: number = 8
  ): { texture: THREE.Texture; thumbUrl: string } {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    if (type === 'wood') {
      // Wood plank pattern with grain
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 1024, 1024);

      // Draw subtle wood grain lines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let i = 0; i < 1024; i += 4) {
        if (Math.random() > 0.4) {
          ctx.fillRect(0, i, 1024, 1 + Math.random() * 2);
        }
      }

      // Plank dividing grout lines
      ctx.strokeStyle = 'rgba(20, 10, 5, 0.45)';
      ctx.lineWidth = 4;
      const numPlanks = 6;
      const plankHeight = 1024 / numPlanks;
      for (let p = 0; p <= numPlanks; p++) {
        ctx.beginPath();
        ctx.moveTo(0, p * plankHeight);
        ctx.lineTo(1024, p * plankHeight);
        ctx.stroke();
      }

      // Staggered vertical cuts
      for (let p = 0; p < numPlanks; p++) {
        const cutX = (p % 2 === 0 ? 0.35 : 0.72) * 1024;
        ctx.beginPath();
        ctx.moveTo(cutX, p * plankHeight);
        ctx.lineTo(cutX, (p + 1) * plankHeight);
        ctx.stroke();
      }
    } else if (type === 'ceramic') {
      // Ceramic tiles with fine grout
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 1024, 1024);

      // Subtle marble noise/grain
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        ctx.beginPath();
        ctx.arc(x, y, 10 + Math.random() * 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crisp tile grout borders
      ctx.strokeStyle = 'rgba(180, 190, 205, 0.65)';
      ctx.lineWidth = 6;
      const tiles = 4;
      const size = 1024 / tiles;
      for (let i = 0; i <= tiles; i++) {
        ctx.beginPath();
        ctx.moveTo(i * size, 0);
        ctx.lineTo(i * size, 1024);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * size);
        ctx.lineTo(1024, i * size);
        ctx.stroke();
      }
    } else if (type === 'marble') {
      // Carrara White marble with elegant soft veins
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 1024, 1024);

      ctx.strokeStyle = 'rgba(120, 135, 155, 0.25)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(100, 0);
      ctx.bezierCurveTo(300, 400, 600, 600, 950, 1024);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(80, 95, 115, 0.18)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 300);
      ctx.bezierCurveTo(400, 450, 700, 300, 1024, 750);
      ctx.stroke();
    } else {
      // Woven Fabric
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 1024, 1024);

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 1024; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 1024);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1024, i);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    // Create a 64x64 thumbnail
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 64;
    thumbCanvas.height = 64;
    const tCtx = thumbCanvas.getContext('2d')!;
    tCtx.drawImage(canvas, 0, 0, 64, 64);
    const thumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.85);

    return { texture, thumbUrl };
  }
}
