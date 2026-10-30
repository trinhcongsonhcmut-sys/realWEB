import { PageSchema, SectionSchema, PopupBlockSchema, DeviceType, BlockType } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { PageStorageService } from '../../shared/utils/storageUtils';
import { BlockRegistry } from '../../popup-blocks/registry/BlockRegistry';

export class BuilderState {
  public page: PageSchema;
  public emitter: EventEmitter;
  public activeSectionId: string | null = null;
  public activeBlockId: string | null = null;
  public currentDevice: DeviceType = 'desktop';
  public isEditMode: boolean = false; // Toggle between preview & visual edit

  private undoStack: string[] = [];
  private redoStack: string[] = [];

  constructor(initialPage: PageSchema, emitter: EventEmitter) {
    this.page = initialPage;
    this.emitter = emitter;
    if (this.page.sections.length > 0) {
      this.activeSectionId = this.page.sections[0].id;
    }
  }

  public saveSnapshot(): void {
    this.undoStack.push(JSON.stringify(this.page));
    if (this.undoStack.length > 20) this.undoStack.shift();
    this.redoStack = [];
  }

  public undo(): boolean {
    if (this.undoStack.length === 0) return false;
    this.redoStack.push(JSON.stringify(this.page));
    const prev = JSON.parse(this.undoStack.pop()!);
    this.page = prev;
    this.emitter.emit('builder:page-updated', this.page);
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    this.undoStack.push(JSON.stringify(this.page));
    const next = JSON.parse(this.redoStack.pop()!);
    this.page = next;
    this.emitter.emit('builder:page-updated', this.page);
    return true;
  }

  public setDevice(device: DeviceType): void {
    this.currentDevice = device;
    this.emitter.emit('builder:device-changed', device);
  }

  public setEditMode(isEdit: boolean): void {
    this.isEditMode = isEdit;
    this.emitter.emit('builder:mode-changed', isEdit);
  }

  public selectBlock(blockId: string | null, sectionId?: string): void {
    this.activeBlockId = blockId;
    if (sectionId) {
      this.activeSectionId = sectionId;
    }
    this.emitter.emit('builder:selection-changed', {
      sectionId: this.activeSectionId,
      blockId: this.activeBlockId
    });
  }

  public getActiveBlock(): PopupBlockSchema | null {
    if (!this.activeBlockId) return null;
    for (const sec of this.page.sections) {
      const found = sec.blocks.find((b) => b.id === this.activeBlockId);
      if (found) return found;
    }
    return null;
  }

  public addSection(type: SectionSchema['type'] = 'full-screen'): SectionSchema {
    this.saveSnapshot();
    const id = `sec-${Date.now()}`;
    const newSec: SectionSchema = {
      id,
      type,
      order: this.page.sections.length,
      enabled: true,
      title: `Section ${this.page.sections.length + 1}`,
      layout: {
        height: type === 'full-screen' ? '100vh' : type === 'half-screen' ? '50vh' : '650px',
        background: '#0d1117'
      },
      blocks: []
    };
    this.page.sections.push(newSec);
    this.activeSectionId = id;
    this.emitter.emit('builder:page-updated', this.page);
    return newSec;
  }

  public deleteSection(sectionId: string): void {
    this.saveSnapshot();
    this.page.sections = this.page.sections.filter((s) => s.id !== sectionId);
    if (this.activeSectionId === sectionId) {
      this.activeSectionId = this.page.sections[0]?.id || null;
      this.activeBlockId = null;
    }
    this.emitter.emit('builder:page-updated', this.page);
  }

  public addBlock(sectionId: string, type: BlockType): PopupBlockSchema {
    this.saveSnapshot();
    const sec = this.page.sections.find((s) => s.id === sectionId);
    if (!sec) throw new Error(`Section ${sectionId} not found`);

    const meta = BlockRegistry.getInstance().getMetadata(type);
    const newBlock: PopupBlockSchema = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      order: sec.blocks.length,
      enabled: true,
      title: meta?.name || 'New Block',
      layout: meta ? { ...meta.defaultLayout } : { width: '420px', height: 'auto', position: 'relative' },
      styling: {
        background: 'rgba(18, 21, 28, 0.88)',
        backdropBlur: '18px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        shadow: '0 24px 48px rgba(0,0,0,0.45)',
        padding: '18px'
      },
      animation: {
        entrance: 'fade-up',
        scrollTrigger: 'center',
        duration: 400
      },
      responsive: {},
      content: meta ? JSON.parse(JSON.stringify(meta.defaultContent)) : {}
    };

    sec.blocks.push(newBlock);
    this.selectBlock(newBlock.id, sectionId);
    this.emitter.emit('builder:page-updated', this.page);
    return newBlock;
  }

  public cloneBlock(blockId: string): void {
    const blk = this.getActiveBlock();
    if (!blk) return;
    this.saveSnapshot();

    const sec = this.page.sections.find((s) => s.blocks.some((b) => b.id === blockId));
    if (!sec) return;

    const cloned: PopupBlockSchema = JSON.parse(JSON.stringify(blk));
    cloned.id = `block-${Date.now()}-clone`;
    cloned.title = `${cloned.title} (Bản sao)`;
    cloned.order = sec.blocks.length;

    // Offset slightly if absolute
    if (cloned.layout.position === 'absolute' && cloned.layout.x && cloned.layout.x.endsWith('px')) {
      cloned.layout.x = `${parseFloat(cloned.layout.x) + 30}px`;
      if (cloned.layout.y && cloned.layout.y.endsWith('px')) {
        cloned.layout.y = `${parseFloat(cloned.layout.y) + 30}px`;
      }
    }

    sec.blocks.push(cloned);
    this.selectBlock(cloned.id, sec.id);
    this.emitter.emit('builder:page-updated', this.page);
  }

  public deleteBlock(blockId: string): void {
    this.saveSnapshot();
    for (const sec of this.page.sections) {
      const idx = sec.blocks.findIndex((b) => b.id === blockId);
      if (idx !== -1) {
        sec.blocks.splice(idx, 1);
        if (this.activeBlockId === blockId) {
          this.activeBlockId = null;
        }
        this.emitter.emit('builder:page-updated', this.page);
        return;
      }
    }
  }

  public toggleBlockVisibility(blockId: string): void {
    this.saveSnapshot();
    const blk = this.getActiveBlock();
    if (blk) {
      blk.enabled = !blk.enabled;
      this.emitter.emit('builder:page-updated', this.page);
    }
  }

  public updateBlock(blockId: string, updates: Partial<PopupBlockSchema>): void {
    for (const sec of this.page.sections) {
      const blk = sec.blocks.find((b) => b.id === blockId);
      if (blk) {
        Object.assign(blk, updates);
        this.emitter.emit('builder:block-updated', blk);
        return;
      }
    }
  }

  public saveDraft(): boolean {
    return PageStorageService.saveDraft(this.page);
  }

  public publish(): boolean {
    return PageStorageService.publish(this.page);
  }
}

