export type FurnitureCategory = 'living' | 'bedroom' | 'dining' | 'office' | 'decor';

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  modelUrl: string;
  thumbnail?: string;
  dimensions?: { width: number; depth: number; height: number };
  defaultMaterialId?: string;
  customizableMeshNames?: string[];
}
