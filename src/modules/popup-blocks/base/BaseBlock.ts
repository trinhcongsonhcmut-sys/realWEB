import { PopupBlockSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';

export abstract class BaseBlock<TContent = any> {
  public schema: PopupBlockSchema<TContent>;
  public emitter: EventEmitter;
  public element: HTMLElement;

  constructor(schema: PopupBlockSchema<TContent>, emitter: EventEmitter) {
    this.schema = schema;
    this.emitter = emitter;
    this.element = this.render();
    this.element.dataset.blockId = schema.id;
    this.element.dataset.blockType = schema.type;
  }

  public abstract render(): HTMLElement;

  public updateContent(content: Partial<TContent>): void {
    this.schema.content = { ...this.schema.content, ...content };
  }

  public dispose(): void {
    this.element.remove();
  }
}

