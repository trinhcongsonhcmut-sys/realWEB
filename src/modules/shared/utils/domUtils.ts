export class DomUtils {
  public static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    className?: string,
    innerHTML?: string
  ): HTMLElementTagNameMap[K] {
    const el = document.createElement(tagName);
    if (className) {
      el.className = className;
    }
    if (innerHTML) {
      el.innerHTML = innerHTML;
    }
    return el;
  }

  public static parseDimension(val?: string, parentDimension: number = window.innerWidth): number {
    if (!val) return 0;
    val = val.trim();
    if (val.endsWith('px')) {
      return parseFloat(val);
    }
    if (val.endsWith('%')) {
      return (parseFloat(val) / 100) * parentDimension;
    }
    if (val.endsWith('vw')) {
      return (parseFloat(val) / 100) * window.innerWidth;
    }
    if (val.endsWith('vh')) {
      return (parseFloat(val) / 100) * window.innerHeight;
    }
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }

  public static makeDraggable(
    element: HTMLElement,
    handle: HTMLElement,
    onMove?: (x: number, y: number) => void,
    onEnd?: (x: number, y: number) => void
  ): () => void {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onPointerDown = (e: PointerEvent) => {
      // Don't drag if clicking buttons, inputs, links, or resize handles
      if ((e.target as HTMLElement).closest('button, input, textarea, select, a, .btn-del-asset, .no-drag, .resize-handle')) {
        return;
      }

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const parentEl = (element.offsetParent as HTMLElement) || element.parentElement || document.body;
      const rect = element.getBoundingClientRect();
      const parentRect = parentEl.getBoundingClientRect();

      // Accurate position relative to parent section wrapper
      initialLeft = rect.left - parentRect.left + parentEl.scrollLeft;
      initialTop = rect.top - parentRect.top + parentEl.scrollTop;

      element.style.position = 'absolute';
      element.style.left = `${Math.round(initialLeft)}px`;
      element.style.top = `${Math.round(initialTop)}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
      element.style.transform = 'none';

      element.classList.add('is-dragging-block');
      document.body.style.userSelect = 'none';

      try {
        handle.setPointerCapture(e.pointerId);
      } catch {}

      e.stopPropagation();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newX = Math.round(initialLeft + dx);
      const newY = Math.round(initialTop + dy);

      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;

      if (onMove) {
        onMove(newX, newY);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      element.classList.remove('is-dragging-block');
      document.body.style.userSelect = '';

      try {
        handle.releasePointerCapture(e.pointerId);
      } catch {}

      const parentEl = (element.offsetParent as HTMLElement) || element.parentElement || document.body;
      const rect = element.getBoundingClientRect();
      const parentRect = parentEl.getBoundingClientRect();
      const finalX = Math.round(rect.left - parentRect.left + parentEl.scrollLeft);
      const finalY = Math.round(rect.top - parentRect.top + parentEl.scrollTop);

      if (onEnd) {
        onEnd(finalX, finalY);
      }
    };

    handle.addEventListener('pointerdown', onPointerDown);
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);

    return () => {
      handle.removeEventListener('pointerdown', onPointerDown);
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', onPointerUp);
      handle.removeEventListener('pointercancel', onPointerUp);
    };
  }

  public static makeResizable(
    element: HTMLElement,
    onResize?: (w: number, h: number, x: number, y: number) => void,
    onEnd?: (w: number, h: number, x: number, y: number) => void
  ): () => void {
    const directions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    const handleElements: HTMLElement[] = [];

    // Remove any existing resize handles first
    element.querySelectorAll('.resize-handle').forEach((h) => h.remove());

    let isResizing = false;
    let currentDir = '';
    let startX = 0;
    let startY = 0;
    let initialWidth = 0;
    let initialHeight = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let curW = 0;
    let curH = 0;
    let curL = 0;
    let curT = 0;
    let dimBadge: HTMLElement | null = null;

    const onPointerDown = (e: PointerEvent, dir: string) => {
      e.stopPropagation();
      e.preventDefault();

      isResizing = true;
      currentDir = dir;
      startX = e.clientX;
      startY = e.clientY;

      const parentEl = (element.offsetParent as HTMLElement) || element.parentElement || document.body;
      const rect = element.getBoundingClientRect();
      const parentRect = parentEl.getBoundingClientRect();

      initialWidth = rect.width;
      initialHeight = rect.height;
      initialLeft = rect.left - parentRect.left + parentEl.scrollLeft;
      initialTop = rect.top - parentRect.top + parentEl.scrollTop;

      curW = initialWidth;
      curH = initialHeight;
      curL = initialLeft;
      curT = initialTop;

      element.style.position = 'absolute';
      element.style.left = `${Math.round(initialLeft)}px`;
      element.style.top = `${Math.round(initialTop)}px`;
      element.style.width = `${Math.round(initialWidth)}px`;
      element.style.height = `${Math.round(initialHeight)}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
      element.style.transform = 'none';

      element.classList.add('is-resizing-block');
      document.body.style.userSelect = 'none';

      dimBadge = DomUtils.createElement('div', 'resize-dims-badge');
      dimBadge.textContent = `${Math.round(curW)} × ${Math.round(curH)} px`;
      element.appendChild(dimBadge);

      const targetHandle = e.currentTarget as HTMLElement;
      try {
        targetHandle.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isResizing) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newW = initialWidth;
      let newH = initialHeight;
      let newL = initialLeft;
      let newT = initialTop;

      // Handle horizontal sizing
      if (currentDir.includes('e')) {
        newW = Math.max(120, Math.round(initialWidth + dx));
      } else if (currentDir.includes('w')) {
        newW = Math.max(120, Math.round(initialWidth - dx));
        newL = Math.round(initialLeft + (initialWidth - newW));
      }

      // Handle vertical sizing
      if (currentDir.includes('s')) {
        newH = Math.max(60, Math.round(initialHeight + dy));
      } else if (currentDir.includes('n')) {
        newH = Math.max(60, Math.round(initialHeight - dy));
        newT = Math.round(initialTop + (initialHeight - newH));
      }

      curW = newW;
      curH = newH;
      curL = newL;
      curT = newT;

      if (currentDir.includes('e') || currentDir.includes('w')) {
        element.style.width = `${curW}px`;
      }
      if (currentDir.includes('w')) {
        element.style.left = `${curL}px`;
      }
      if (currentDir.includes('s') || currentDir.includes('n')) {
        element.style.height = `${curH}px`;
      }
      if (currentDir.includes('n')) {
        element.style.top = `${curT}px`;
      }

      if (dimBadge) {
        dimBadge.textContent = `${curW} × ${curH} px`;
      }

      if (onResize) {
        onResize(curW, curH, curL, curT);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isResizing) return;
      isResizing = false;
      element.classList.remove('is-resizing-block');
      document.body.style.userSelect = '';
      dimBadge?.remove();
      dimBadge = null;

      const targetHandle = e.currentTarget as HTMLElement;
      try {
        targetHandle.releasePointerCapture(e.pointerId);
      } catch {}

      if (onEnd) {
        onEnd(curW, curH, curL, curT);
      }
    };

    directions.forEach((dir) => {
      const handle = DomUtils.createElement('div', `resize-handle resize-handle-${dir}`);
      handle.dataset.direction = dir;
      handle.addEventListener('pointerdown', (e) => onPointerDown(e, dir));
      handle.addEventListener('pointermove', onPointerMove);
      handle.addEventListener('pointerup', onPointerUp);
      handle.addEventListener('pointercancel', onPointerUp);

      element.appendChild(handle);
      handleElements.push(handle);
    });

    return () => {
      handleElements.forEach((h) => h.remove());
    };
  }
}
