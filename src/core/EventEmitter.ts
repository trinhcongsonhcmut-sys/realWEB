export type Listener = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, Set<Listener>> = new Map();

  public on(event: string, listener: Listener): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  public off(event: string, listener: Listener): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
  }

  public emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (err) {
          console.error(`Error in event listener for "${event}":`, err);
        }
      });
    }
  }

  public clear(): void {
    this.events.clear();
  }
}
