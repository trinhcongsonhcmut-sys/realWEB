export interface CustomColorOption {
  id: string;
  name: string;
  color: string; // #hex
  roughness: number;
  metalness?: number;
  isCustom?: boolean;
}

export interface CustomMaterialOption {
  id: string;
  name: string;
  type: 'wood' | 'ceramic' | 'marble' | 'fabric' | 'metal' | 'glass' | 'custom';
  thumbUrl: string; // data:image/... or preset URL
  textureDataUrl?: string; // image DataURL if uploaded
  textureUrl?: string; // alias for textureDataUrl
  color?: string;
  roughness: number;
  metalness: number;
  repeatX?: number;
  repeatY?: number;
  isCustom?: boolean;
}

export interface ItemCustomizationData {
  colors: CustomColorOption[];
  materials: CustomMaterialOption[];
}

const STORAGE_KEY = 'AURA_3D_CUSTOMIZER_STORE_V2';

export class DynamicCustomizerStore {
  private store: Record<string, ItemCustomizationData> = {};

  constructor() {
    this.loadFromStorage();
    this.ensureDefaults();
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.store = JSON.parse(data);
      }
    } catch (e) {
      console.warn('[DynamicCustomizerStore] Could not load from localStorage', e);
      this.store = {};
    }
  }

  public saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch (e) {
      console.warn('[DynamicCustomizerStore] Could not save to localStorage', e);
    }
  }

  private ensureDefaults(): void {
    // 1. CÂY ĐÈN ĐỨNG / ĐÈN NGỦ (dencao)
    if (!this.store['dencao']) {
      this.store['dencao'] = {
        colors: [
          { id: 'lamp-gold', name: 'Vàng Ánh Kim Brass', color: '#d4af37', roughness: 0.25, metalness: 0.88 },
          { id: 'lamp-walnut', name: 'Nâu Gỗ Walnut', color: '#452c1e', roughness: 0.5, metalness: 0.05 },
          { id: 'lamp-ruby', name: 'Đỏ Rượu Ấm Ruby', color: '#881337', roughness: 0.65, metalness: 0.1 },
          { id: 'lamp-washi', name: 'Trắng Sữa Washi', color: '#faf7f2', roughness: 0.85, metalness: 0.0 },
          { id: 'lamp-black', name: 'Thép Đen Mờ Modern', color: '#18181b', roughness: 0.6, metalness: 0.8 }
        ],
        materials: [
          {
            id: 'mat-washi-paper',
            name: 'Chao Giấy Washi Thủ Công',
            type: 'fabric',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23f7f4ec"/><circle cx="30" cy="30" r="22" fill="%23efe8da" opacity="0.6"/></svg>',
            color: '#fbf8f0',
            roughness: 0.92,
            metalness: 0.0
          },
          {
            id: 'mat-brushed-brass',
            name: 'Kim Loại Đồng Vàng Xước',
            type: 'metal',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23d4af37"/><line x1="0" y1="15" x2="60" y2="15" stroke="%23b89228" stroke-width="2"/><line x1="0" y1="35" x2="60" y2="35" stroke="%23f3d768" stroke-width="2"/><line x1="0" y1="48" x2="60" y2="48" stroke="%23a07a18" stroke-width="1.5"/></svg>',
            color: '#d4af37',
            roughness: 0.22,
            metalness: 0.92
          },
          {
            id: 'mat-dark-wood',
            name: 'Gỗ Tự Nhiên Sơn Cánh Gián',
            type: 'wood',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%233e2718"/><line x1="0" y1="12" x2="60" y2="12" stroke="%232b1a10" stroke-width="3"/><line x1="0" y1="32" x2="60" y2="32" stroke="%234f3320" stroke-width="2"/><line x1="0" y1="46" x2="60" y2="46" stroke="%2326160d" stroke-width="2.5"/></svg>',
            color: '#3e2718',
            roughness: 0.42,
            metalness: 0.05
          }
        ]
      };
    }

    // 2. ĐÈN BÀN 3 CHÂN (denban3chan)
    if (!this.store['denban3chan']) {
      this.store['denban3chan'] = {
        colors: [
          { id: 'table-lamp-gold', name: 'Vàng Hoàng Gia', color: '#eab308', roughness: 0.3, metalness: 0.8 },
          { id: 'table-lamp-brown', name: 'Nâu Cánh Gián', color: '#543217', roughness: 0.5, metalness: 0.05 },
          { id: 'table-lamp-red', name: 'Đỏ San Hô Terracotta', color: '#c2410c', roughness: 0.7, metalness: 0.1 },
          { id: 'table-lamp-cream', name: 'Trắng Sứ Scandinavian', color: '#f5f5f4', roughness: 0.8, metalness: 0.0 }
        ],
        materials: [
          {
            id: 'mat-cream-ceramic',
            name: 'Gốm Sứ Men Mờ',
            type: 'ceramic',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23ede8df"/></svg>',
            color: '#f5f0e6',
            roughness: 0.65,
            metalness: 0.02
          },
          {
            id: 'mat-walnut-base',
            name: 'Chân Gỗ Óc Chó',
            type: 'wood',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23422a1d"/></svg>',
            color: '#422a1d',
            roughness: 0.45,
            metalness: 0.05
          }
        ]
      };
    }

    // 3. SÀN NHÀ PHÒNG KHÁCH (floor / foundation)
    if (!this.store['floor']) {
      this.store['floor'] = {
        colors: [
          { id: 'floor-white-tile', name: 'Gạch Ceramic Trắng Sữa', color: '#f1ede4', roughness: 0.15, metalness: 0.05 },
          { id: 'floor-oak-tint', name: 'Gỗ Sồi Vàng Nhạt', color: '#c89d6d', roughness: 0.38, metalness: 0.05 },
          { id: 'floor-walnut-tint', name: 'Gỗ Óc Chó Nâu Trầm', color: '#533a25', roughness: 0.42, metalness: 0.05 },
          { id: 'floor-grey-tint', name: 'Bê Tông Xám Industrial', color: '#64748b', roughness: 0.7, metalness: 0.05 }
        ],
        materials: [
          {
            id: 'floor-silver-oak-veneer',
            name: 'Sàn Gỗ Sồi Bạc Veneer Cao Cấp (Silver Oak 2K)',
            type: 'wood',
            thumbUrl: '/assets/materials/wood/silver_oak_veneer_02_diff_2k.jpg',
            textureDataUrl: '/assets/materials/wood/silver_oak_veneer_02_diff_2k.jpg',
            textureUrl: '/assets/materials/wood/silver_oak_veneer_02_diff_2k.jpg',
            color: '#b5a999',
            roughness: 0.38,
            metalness: 0.05,
            repeatX: 4,
            repeatY: 8
          },
          {
            id: 'floor-ceramic-gloss',
            name: 'Gạch Men Ceramic Bóng Ý 80x80',
            type: 'ceramic',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23f8fafc"/><line x1="0" y1="30" x2="60" y2="30" stroke="%23cbd5e1" stroke-width="1.5"/><line x1="30" y1="0" x2="30" y2="60" stroke="%23cbd5e1" stroke-width="1.5"/></svg>',
            color: '#f5f5f7',
            roughness: 0.12,
            metalness: 0.08,
            repeatX: 4,
            repeatY: 8
          },
          {
            id: 'floor-light-oak',
            name: 'Sàn Gỗ Sồi Tự Nhiên (Light Oak)',
            type: 'wood',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23c89d6d"/><line x1="0" y1="15" x2="60" y2="15" stroke="%23b08556" stroke-width="2"/><line x1="0" y1="30" x2="60" y2="30" stroke="%238a6034" stroke-width="2"/><line x1="0" y1="45" x2="60" y2="45" stroke="%23b08556" stroke-width="2"/><line x1="25" y1="0" x2="25" y2="15" stroke="%238a6034" stroke-width="1.5"/><line x1="45" y1="15" x2="45" y2="30" stroke="%238a6034" stroke-width="1.5"/><line x1="18" y1="30" x2="18" y2="45" stroke="%238a6034" stroke-width="1.5"/><line x1="40" y1="45" x2="40" y2="60" stroke="%238a6034" stroke-width="1.5"/></svg>',
            color: '#bfa27a',
            roughness: 0.35,
            metalness: 0.05,
            repeatX: 4,
            repeatY: 8
          },
          {
            id: 'floor-dark-walnut',
            name: 'Sàn Gỗ Óc Chó Bắc Mỹ (Walnut)',
            type: 'wood',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23452b1b"/><line x1="0" y1="15" x2="60" y2="15" stroke="%232b180d" stroke-width="2"/><line x1="0" y1="30" x2="60" y2="30" stroke="%235a3924" stroke-width="2"/><line x1="0" y1="45" x2="60" y2="45" stroke="%232b180d" stroke-width="2"/><line x1="30" y1="0" x2="30" y2="15" stroke="%232b180d" stroke-width="1.5"/><line x1="48" y1="15" x2="48" y2="30" stroke="%232b180d" stroke-width="1.5"/><line x1="20" y1="30" x2="20" y2="45" stroke="%232b180d" stroke-width="1.5"/><line x1="42" y1="45" x2="42" y2="60" stroke="%232b180d" stroke-width="1.5"/></svg>',
            color: '#4a3221',
            roughness: 0.38,
            metalness: 0.05,
            repeatX: 4,
            repeatY: 8
          },
          {
            id: 'floor-carrara-marble',
            name: 'Đá Cẩm Thạch Trắng Vân Mây Carrara',
            type: 'marble',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23f8fafc"/><path d="M5,15 Q25,25 40,10 T55,30" stroke="%2394a3b8" stroke-width="1.8" fill="none" opacity="0.6"/><path d="M10,45 Q30,35 50,55" stroke="%23cbd5e1" stroke-width="2.5" fill="none" opacity="0.7"/></svg>',
            color: '#f8fafc',
            roughness: 0.16,
            metalness: 0.12,
            repeatX: 3,
            repeatY: 6
          }
        ]
      };
    }

    // 4. BỘ SOFA (sofa)
    if (!this.store['sofa']) {
      this.store['sofa'] = {
        colors: [
          { id: 'sofa-sand', name: 'Be Cát Sa Mạc', color: '#d0c6b4', roughness: 0.88, metalness: 0.0 },
          { id: 'sofa-charcoal', name: 'Xám Ghi Charcoal', color: '#2d3138', roughness: 0.85, metalness: 0.05 },
          { id: 'sofa-navy', name: 'Xanh Navy Hoàng Gia', color: '#1a2744', roughness: 0.82, metalness: 0.05 },
          { id: 'sofa-terracotta', name: 'Cam Đất Terracotta', color: '#9e4732', roughness: 0.84, metalness: 0.05 },
          { id: 'sofa-sage', name: 'Xanh Rêu Sage Zen', color: '#4a5d4e', roughness: 0.86, metalness: 0.0 }
        ],
        materials: [
          {
            id: 'sofa-fabric-coarse',
            name: 'Vải Nỉ Thô Wabi-Sabi Tự Nhiên',
            type: 'fabric',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23c4baa8"/><line x1="0" y1="10" x2="60" y2="10" stroke="%23aba18f" stroke-width="1" stroke-dasharray="2,2"/><line x1="0" y1="20" x2="60" y2="20" stroke="%23aba18f" stroke-width="1" stroke-dasharray="2,2"/><line x1="0" y1="30" x2="60" y2="30" stroke="%23aba18f" stroke-width="1" stroke-dasharray="2,2"/><line x1="0" y1="40" x2="60" y2="40" stroke="%23aba18f" stroke-width="1" stroke-dasharray="2,2"/></svg>',
            color: '#cfc5b4',
            roughness: 0.9,
            metalness: 0.0
          },
          {
            id: 'sofa-leather-cognac',
            name: 'Da Bò Thuộc Cao Cấp Cognac',
            type: 'custom',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%2385431f"/><circle cx="20" cy="20" r="15" fill="%239c5127" opacity="0.5"/><circle cx="45" cy="40" r="18" fill="%236e3516" opacity="0.5"/></svg>',
            color: '#8b4513',
            roughness: 0.45,
            metalness: 0.15
          }
        ]
      };
    }

    // 5. BÀN TRÀ & KỆ (bansofa / ketivi)
    if (!this.store['table']) {
      this.store['table'] = {
        colors: [
          { id: 'table-oak', name: 'Gỗ Sồi Sáng', color: '#c89d6d', roughness: 0.4, metalness: 0.05 },
          { id: 'table-walnut', name: 'Gỗ Óc Chó Đậm', color: '#432918', roughness: 0.45, metalness: 0.05 },
          { id: 'table-black', name: 'Thép Đen Mờ', color: '#1c1c1f', roughness: 0.5, metalness: 0.8 },
          { id: 'table-white-marble', name: 'Đá Trắng', color: '#f8fafc', roughness: 0.18, metalness: 0.1 }
        ],
        materials: [
          {
            id: 'table-mat-wood',
            name: 'Gỗ Tự Nhiên Nguyên Tấm',
            type: 'wood',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%239c6d3b"/><line x1="0" y1="20" x2="60" y2="20" stroke="%237a5229" stroke-width="2.5"/><line x1="0" y1="40" x2="60" y2="40" stroke="%23b8854f" stroke-width="2"/></svg>',
            color: '#9c6d3b',
            roughness: 0.42,
            metalness: 0.05
          },
          {
            id: 'table-mat-marble',
            name: 'Mặt Đá Cẩm Thạch Cao Cấp',
            type: 'marble',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23f1f5f9"/><path d="M10,10 Q30,40 50,20" stroke="%2394a3b8" stroke-width="2" fill="none"/></svg>',
            color: '#f8fafc',
            roughness: 0.15,
            metalness: 0.1
          }
        ]
      };
    }

    // 6. GHẾ SOFA (ghesofa alias)
    if (!this.store['ghesofa']) {
      this.store['ghesofa'] = JSON.parse(JSON.stringify(this.store['sofa']));
    }

    // 7. BÀN TRÀ SOFA (bansofa alias)
    if (!this.store['bansofa']) {
      this.store['bansofa'] = JSON.parse(JSON.stringify(this.store['table']));
    }

    // 8. THẢM SÀN (thamsofa)
    if (!this.store['thamsofa']) {
      this.store['thamsofa'] = {
        colors: [
          { id: 'carpet-sand', name: 'Be Cát Tự Nhiên', color: '#c9bfa8', roughness: 0.95, metalness: 0.0 },
          { id: 'carpet-grey', name: 'Xám Ghi Mộc', color: '#4b5563', roughness: 0.95, metalness: 0.0 },
          { id: 'carpet-clay', name: 'Nâu Đất Mộc', color: '#7c5843', roughness: 0.92, metalness: 0.0 },
          { id: 'carpet-charcoal', name: 'Than Đen Hiện Đại', color: '#1f2937', roughness: 0.9, metalness: 0.05 }
        ],
        materials: [
          {
            id: 'carpet-mat-jute',
            name: 'Sợi Gai Tự Nhiên Dệt Tay',
            type: 'fabric',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23c2b69d"/><path d="M0,0 L60,60 M60,0 L0,60" stroke="%23a89a7f" stroke-width="2"/></svg>',
            color: '#c2b69d',
            roughness: 0.95,
            metalness: 0.0,
            repeatX: 4,
            repeatY: 4
          }
        ]
      };
    }

    // 9. KỆ TỦ TIVI (ketivi)
    if (!this.store['ketivi']) {
      this.store['ketivi'] = {
        colors: [
          { id: 'ketivi-walnut', name: 'Gỗ Óc Chó Bắc Mỹ', color: '#3d2516', roughness: 0.45, metalness: 0.05 },
          { id: 'ketivi-oak', name: 'Gỗ Sồi Tự Nhiên', color: '#c29a6b', roughness: 0.42, metalness: 0.05 },
          { id: 'ketivi-black', name: 'Đen Mờ Tối Giản', color: '#18181b', roughness: 0.5, metalness: 0.2 },
          { id: 'ketivi-white', name: 'Trắng Sữa Scandinavian', color: '#f8fafc', roughness: 0.35, metalness: 0.0 }
        ],
        materials: [
          {
            id: 'ketivi-mat-wood',
            name: 'Gỗ Tự Nhiên Cao Cấp',
            type: 'wood',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%235c3a21"/></svg>',
            color: '#5c3a21',
            roughness: 0.42,
            metalness: 0.05
          }
        ]
      };
    }

    // 10. SMART TV (tivi)
    if (!this.store['tivi']) {
      this.store['tivi'] = {
        colors: [
          { id: 'tivi-darkmetal', name: 'Thép Đen Titan', color: '#18181b', roughness: 0.3, metalness: 0.9 },
          { id: 'tivi-silver', name: 'Bạc Ánh Kim Aluminum', color: '#d1d5db', roughness: 0.2, metalness: 0.95 },
          { id: 'tivi-gold', name: 'Viền Vàng Champagne', color: '#d4af37', roughness: 0.25, metalness: 0.88 }
        ],
        materials: [
          {
            id: 'tivi-mat-metal',
            name: 'Kim Loại Anodized Siêu Bền',
            type: 'metal',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%2327272a"/></svg>',
            color: '#27272a',
            roughness: 0.25,
            metalness: 0.9
          }
        ]
      };
    }

    // Guarantee Silver Oak Veneer is always present in floor materials even if loaded from older localStorage
    if (this.store['floor'] && this.store['floor'].materials) {
      this.store['floor'].materials = this.store['floor'].materials.filter((m) => m.id !== 'floor-silver-oak-veneer');
      this.store['floor'].materials.unshift({
        id: 'floor-silver-oak-veneer',
        name: 'Sàn Gỗ Sồi Bạc Veneer Cao Cấp (Silver Oak 2K)',
        type: 'wood',
        thumbUrl: '/assets/materials/wood/silver_oak_veneer_02_diff_2k.jpg',
        textureDataUrl: '/assets/materials/wood/silver_oak_veneer_02_diff_2k.jpg',
        textureUrl: '/assets/materials/wood/silver_oak_veneer_02_diff_2k.jpg',
        color: '#ffffff',
        roughness: 0.38,
        metalness: 0.05,
        repeatX: 4,
        repeatY: 8
      });
      this.saveToStorage();
    }
  }

  public getItemData(itemKey: string): ItemCustomizationData {
    if (!this.store[itemKey]) {
      // Fallback clone general data
      this.store[itemKey] = {
        colors: [
          { id: `${itemKey}-gold`, name: 'Vàng Ánh Kim', color: '#d4af37', roughness: 0.3, metalness: 0.8 },
          { id: `${itemKey}-walnut`, name: 'Nâu Gỗ Tự Nhiên', color: '#533826', roughness: 0.5, metalness: 0.05 },
          { id: `${itemKey}-red`, name: 'Đỏ Đô Sang Trọng', color: '#991b1b', roughness: 0.6, metalness: 0.1 },
          { id: `${itemKey}-white`, name: 'Trắng Sữa', color: '#f8fafc', roughness: 0.7, metalness: 0.0 },
          { id: `${itemKey}-black`, name: 'Đen Mờ Modern', color: '#18181b', roughness: 0.55, metalness: 0.6 }
        ],
        materials: [
          {
            id: `${itemKey}-mat-standard`,
            name: 'Chất Liệu Tiêu Chuẩn',
            type: 'custom',
            thumbUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%2394a3b8"/></svg>',
            color: '#ffffff',
            roughness: 0.5,
            metalness: 0.1
          }
        ]
      };
      this.saveToStorage();
    }
    return this.store[itemKey];
  }

  public getColorsForItem(itemKey: string): CustomColorOption[] {
    return this.getItemData(itemKey).colors;
  }

  public getMaterialsForItem(itemKey: string): CustomMaterialOption[] {
    return this.getItemData(itemKey).materials;
  }

  public addColor(itemKey: string, color: CustomColorOption): void {
    const data = this.getItemData(itemKey);
    // Remove if exists
    data.colors = data.colors.filter((c) => c.id !== color.id);
    data.colors.unshift(color);
    this.saveToStorage();
  }

  public removeColor(itemKey: string, colorId: string): void {
    const data = this.getItemData(itemKey);
    data.colors = data.colors.filter((c) => c.id !== colorId);
    this.saveToStorage();
  }

  public addMaterial(itemKey: string, material: CustomMaterialOption): void {
    const data = this.getItemData(itemKey);
    // Remove if exists
    data.materials = data.materials.filter((m) => m.id !== material.id);
    data.materials.unshift(material);
    this.saveToStorage();
  }

  public removeMaterial(itemKey: string, materialId: string): void {
    const data = this.getItemData(itemKey);
    data.materials = data.materials.filter((m) => m.id !== materialId);
    this.saveToStorage();
  }
}
