export type PBRMaterialType = 'wood' | 'metal' | 'glass' | 'marble' | 'fabric' | 'leather';

export interface PBRMaterialPreset {
  id: string;
  name: string;
  type: PBRMaterialType;
  color: string;
  roughness: number;
  metalness?: number;
  transmission?: number;
  ior?: number;
  previewColor?: string;
}
