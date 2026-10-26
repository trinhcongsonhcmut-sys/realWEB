import { PBRMaterialPreset } from '../../types/material.types';

export const PBR_MATERIALS_LIBRARY: Record<string, PBRMaterialPreset> = {
  oak_wood: {
    id: 'oak_wood',
    name: 'Gỗ Sồi Tự Nhiên (Light Oak)',
    type: 'wood',
    color: '#ad7e4e',
    roughness: 0.38,
    metalness: 0.05,
    previewColor: '#ad7e4e'
  },
  walnut_wood: {
    id: 'walnut_wood',
    name: 'Gỗ Óc Chó Trầm (Dark Walnut)',
    type: 'wood',
    color: '#3d2817',
    roughness: 0.45,
    metalness: 0.05,
    previewColor: '#3d2817'
  },
  brass_gold: {
    id: 'brass_gold',
    name: 'Đồng Vàng Ánh Kim (Brushed Brass)',
    type: 'metal',
    color: '#d4af37',
    roughness: 0.22,
    metalness: 0.92,
    previewColor: '#d4af37'
  },
  matte_black_steel: {
    id: 'matte_black_steel',
    name: 'Thép Đen Mờ Hiện Đại',
    type: 'metal',
    color: '#1a1a1e',
    roughness: 0.65,
    metalness: 0.85,
    previewColor: '#1a1a1e'
  },
  clear_glass: {
    id: 'clear_glass',
    name: 'Kính Trong Suốt Siêu Nét',
    type: 'glass',
    color: '#ffffff',
    roughness: 0.05,
    transmission: 0.95,
    ior: 1.52,
    previewColor: '#e0f2fe'
  },
  smoked_glass: {
    id: 'smoked_glass',
    name: 'Kính Khói Sang Trọng',
    type: 'glass',
    color: '#374151',
    roughness: 0.08,
    transmission: 0.85,
    ior: 1.54,
    previewColor: '#4b5563'
  },
  carrara_marble: {
    id: 'carrara_marble',
    name: 'Đá Marble Trắng Vân Mây Carrara',
    type: 'marble',
    color: '#f8fafc',
    roughness: 0.18,
    metalness: 0.1,
    previewColor: '#f1f5f9'
  },
  leather_cognac: {
    id: 'leather_cognac',
    name: 'Da Bò Màu Nâu Cognac Cao Cấp',
    type: 'leather',
    color: '#8b4513',
    roughness: 0.62,
    metalness: 0.05,
    previewColor: '#8b4513'
  },
  fabric_gray: {
    id: 'fabric_gray',
    name: 'Vải Nỉ Xám Bắc Âu (Nordic Gray)',
    type: 'fabric',
    color: '#475569',
    roughness: 0.88,
    metalness: 0.02,
    previewColor: '#64748b'
  }
};

export function getPBRMaterial(id: string): PBRMaterialPreset | undefined {
  return PBR_MATERIALS_LIBRARY[id];
}
