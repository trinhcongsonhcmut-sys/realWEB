/**
 * popupRegistry.ts
 * Central registry for managing and registering all extensible popups.
 * Highly scalable architecture allowing seamless addition of large/small/custom popups.
 */

import { PopupItem } from './types';
import { createProjectOverviewPopup } from './components/ProjectOverviewPopup';
import { createUploadContentPopup } from './components/UploadContentPopup';
import { createArchitectureSpecsPopup } from './components/ArchitectureSpecsPopup';
import { createContactActionPopup } from './components/ContactActionPopup';

export class PopupRegistry {
  private popups: Map<string, PopupItem> = new Map();

  constructor() {
    this.registerDefaults();
  }

  /**
   * Register a new popup into the system
   */
  public register(item: PopupItem): void {
    if (this.popups.has(item.id)) {
      console.warn(`[PopupRegistry] Overwriting existing popup ID: ${item.id}`);
    }
    this.popups.set(item.id, item);
  }

  /**
   * Remove a popup by ID
   */
  public unregister(id: string): boolean {
    return this.popups.delete(id);
  }

  /**
   * Retrieve all popups sorted by their defined order
   */
  public getAll(): PopupItem[] {
    return Array.from(this.popups.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Find a popup by ID
   */
  public get(id: string): PopupItem | undefined {
    return this.popups.get(id);
  }

  /**
   * Register default initial set of architectural popups
   */
  private registerDefaults(): void {
    this.register(createProjectOverviewPopup());
    this.register(createUploadContentPopup());
    this.register(createArchitectureSpecsPopup());
    this.register(createContactActionPopup());
  }
}

