import { PageSchema, SectionSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { SectionContainer } from '../components/SectionContainer';

export class ScrollingPageEngine {
  public pageSchema: PageSchema;
  public emitter: EventEmitter;
  public rootContainer: HTMLElement;

  private sectionContainers: Map<string, SectionContainer> = new Map();
  private observer?: IntersectionObserver;
  private isHeroScrubbing: boolean = true;
  private is3dInteracting: boolean = false;
  private isDisposed: boolean = false;

  constructor(rootContainer: HTMLElement, pageSchema: PageSchema, emitter: EventEmitter) {
    this.rootContainer = rootContainer;
    this.pageSchema = pageSchema;
    this.emitter = emitter;

    this.rootContainer.classList.add('scrolling-page-root');
    this.setupIntersectionObserver();
    this.bindEvents();
  }

  private setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      root: null,
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const secId = (entry.target as HTMLElement).dataset.sectionId;
        if (!secId) return;

        const secContainer = this.sectionContainers.get(secId);
        if (secContainer) {
          secContainer.updateVisibility(entry.intersectionRatio);
        }

        this.emitter.emit('section:visibility-change', {
          sectionId: secId,
          ratio: entry.intersectionRatio,
          isIntersecting: entry.isIntersecting
        });
      });
    }, options);
  }

  public registerSectionContainer(secContainer: SectionContainer): void {
    this.sectionContainers.set(secContainer.schema.id, secContainer);
    if (this.observer) {
      this.observer.observe(secContainer.element);
    }
  }

  private bindEvents(): void {
    // Listen for 3D interaction: do not interfere with 3D canvas
    this.emitter.on('3d:interacting', (interacting: boolean) => {
      this.is3dInteracting = interacting;
    });

    // Listen for video scrub completion: unlocks smooth transition down
    this.emitter.on('motion:video-completed', () => {
      this.isHeroScrubbing = false;
    });

    this.emitter.on('scroll:completed', () => {
      this.isHeroScrubbing = false;
    });

    this.emitter.on('motion:video-rewound', () => {
      this.isHeroScrubbing = true;
    });

    // Native scroll event listener for parallax and active section tracking
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  private onScroll = (): void => {
    if (this.isDisposed) return;
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // Check if user scrolled back to top
    if (scrollY <= 10) {
      this.isHeroScrubbing = true;
    }

    // Parallax update
    this.sectionContainers.forEach((sec) => {
      if (sec.schema.layout.parallax) {
        const rect = sec.element.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          const offset = (rect.top - vh / 2) * 0.18;
          const wrapper = sec.getInnerWrapper();
          wrapper.style.transform = `translateY(${offset}px)`;
        }
      }
    });

    this.emitter.emit('page:scroll', { scrollY, vh });
  };

  public scrollToSection(sectionId: string): void {
    const sec = this.sectionContainers.get(sectionId);
    if (sec) {
      sec.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  public dispose(): void {
    this.isDisposed = true;
    window.removeEventListener('scroll', this.onScroll);
    if (this.observer) {
      this.observer.disconnect();
    }
    this.sectionContainers.forEach((sec) => sec.dispose());
    this.sectionContainers.clear();
  }
}

