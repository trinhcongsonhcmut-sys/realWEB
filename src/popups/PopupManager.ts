/**
 * PopupManager.ts
 * Manages the mounting, rendering, scroll-triggered reveals, and transitions
 * between the Hero Video Scroller and the extensible Popups Section.
 */

import { EventEmitter } from '../core/EventEmitter';
import { PopupRegistry } from './popupRegistry';
import { PopupItem } from './types';

export class PopupManager {
  public container: HTMLElement;
  public registry: PopupRegistry;
  public emitter: EventEmitter;
  private observer: IntersectionObserver | null = null;
  private isVisible: boolean = false;

  constructor(mountContainer: HTMLElement, emitter: EventEmitter) {
    this.container = mountContainer;
    this.emitter = emitter;
    this.registry = new PopupRegistry();

    this.init();
  }

  private init(): void {
    this.container.classList.add('popups-container');
    this.renderAll();
    this.setupIntersectionObserver();
    this.bindEvents();
  }

  /**
   * Render all registered popups into the container
   */
  public renderAll(): void {
    this.container.innerHTML = '';
    const popups = this.registry.getAll();

    popups.forEach((popup) => {
      const wrapper = document.createElement('section');
      wrapper.className = `popup-section-wrapper size-${popup.size}`;
      wrapper.id = popup.id;
      wrapper.setAttribute('data-popup-id', popup.id);

      const renderedCard = popup.render(this);
      wrapper.appendChild(renderedCard);
      this.container.appendChild(wrapper);
    });
  }

  /**
   * Observer to trigger smooth reveal animations when scrolling into cards
   */
  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          const popupId = entry.target.getAttribute('data-popup-id');
          if (popupId) {
            this.emitter.emit('popup:enter', popupId);
          }
        }
      });
    }, options);

    const wrappers = this.container.querySelectorAll('.popup-section-wrapper');
    wrappers.forEach((w) => this.observer?.observe(w));
  }

  private bindEvents(): void {
    // Listen for scroll to top hero button
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('#btn-back-to-video-top')) {
        this.scrollToVideo();
      }
    });
  }

  /**
   * Smoothly scroll into the first popup card
   */
  public scrollIntoPopups(): void {
    this.isVisible = true;
    this.container.classList.add('active');
    const firstPopup = this.container.firstElementChild as HTMLElement;
    if (firstPopup) {
      firstPopup.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Smoothly scroll back to top hero video
   */
  public scrollToVideo(): void {
    this.isVisible = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const hero = document.getElementById('hero-video-section');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Add a new popup dynamically at runtime
   */
  public addPopup(popup: PopupItem): void {
    this.registry.register(popup);
    this.renderAll();
    this.setupIntersectionObserver();
  }

  public dispose(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

