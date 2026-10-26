import { FurnitureItem } from '../../types/furniture.types';

export const FURNITURE_CATALOG: FurnitureItem[] = [

  {
    id: 'nordic_l_sofa',
    name: 'Sofa Góc L Phong Cách Bắc Âu',
    category: 'living',
    modelUrl: '/assets/furniture/living/sofa_nordic.glb',
    defaultMaterialId: 'fabric_gray',
    dimensions: { width: 2.4, depth: 1.6, height: 0.85 }
  },
  {
    id: 'round_coffee_table',
    name: 'Bàn Trà Tròn Mặt Kính Khói',
    category: 'living',
    modelUrl: '/assets/furniture/living/coffee_table.glb',
    defaultMaterialId: 'smoked_glass',
    dimensions: { width: 0.9, depth: 0.9, height: 0.42 }
  },
  {
    id: 'luxury_king_bed',
    name: 'Giường Ngủ Master King Size',
    category: 'bedroom',
    modelUrl: '/assets/furniture/bedroom/king_bed.glb',
    defaultMaterialId: 'leather_cognac',
    dimensions: { width: 2.0, depth: 2.2, height: 1.1 }
  },
  {
    id: 'dining_table_marble',
    name: 'Bàn Ăn 6 Ghế Mặt Đá Marble',
    category: 'dining',
    modelUrl: '/assets/furniture/dining/dining_table.glb',
    defaultMaterialId: 'carrara_marble',
    dimensions: { width: 1.8, depth: 0.9, height: 0.75 }
  },
  {
    id: 'arc_floor_lamp',
    name: 'Đèn Cây Vòm Đứng Kim Loại Vàng',
    category: 'decor',
    modelUrl: '/assets/furniture/decor/floor_lamp.glb',
    defaultMaterialId: 'brass_gold',
    dimensions: { width: 0.5, depth: 1.2, height: 2.0 }
  }
];

export function getFurnitureItemById(id: string): FurnitureItem | undefined {
  return FURNITURE_CATALOG.find((item) => item.id === id);
}

export function getFurnitureByCategory(category: string): FurnitureItem[] {
  return FURNITURE_CATALOG.filter((item) => item.category === category);
}
