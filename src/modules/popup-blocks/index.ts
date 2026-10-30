export * from './base/BaseBlock';
export * from './registry/BlockRegistry';
export * from './blocks/HeroVideoBlock';
export * from './blocks/Hero3DBlock';
export * from './blocks/ImageBlock';
export * from './blocks/TextBlock';
export * from './blocks/VideoBlock';
export * from './blocks/GalleryBlock';
export * from './blocks/Model3DBlock';
export * from './blocks/MapBlock';
export * from './blocks/SpecificationsBlock';
export * from './blocks/ComparisonBlock';
export * from './blocks/InformationCardBlock';
export * from './blocks/CustomContainerBlock';

import { BlockRegistry } from './registry/BlockRegistry';

// Ensure singleton is instantiated and all 10 blocks are registered
export const blockRegistry = BlockRegistry.getInstance();
