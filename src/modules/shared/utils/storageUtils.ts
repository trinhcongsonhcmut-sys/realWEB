import { PageSchema } from '../schemas/page.types';
import { PageSchemaValidator } from '../validation/schemaValidator';

const DRAFT_KEY_PREFIX = 'realweb_page_draft_';
const PUBLISHED_KEY_PREFIX = 'realweb_page_published_';
const HISTORY_KEY_PREFIX = 'realweb_page_history_';

export class PageStorageService {
  public static saveDraft(page: PageSchema): boolean {
    try {
      const sanitized = PageSchemaValidator.sanitize(page);
      sanitized.status = 'draft';
      sanitized.updatedAt = new Date().toISOString();
      localStorage.setItem(`${DRAFT_KEY_PREFIX}${page.id}`, JSON.stringify(sanitized));
      this.pushHistory(sanitized);
      return true;
    } catch (e) {
      console.error('Failed to save draft:', e);
      return false;
    }
  }

  public static loadDraft(pageId: string): PageSchema | null {
    try {
      const raw = localStorage.getItem(`${DRAFT_KEY_PREFIX}${pageId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const val = PageSchemaValidator.validate(parsed);
      return val.valid ? (parsed as PageSchema) : null;
    } catch (e) {
      console.error('Failed to load draft:', e);
      return null;
    }
  }

  public static publish(page: PageSchema): boolean {
    try {
      const sanitized = PageSchemaValidator.sanitize(page);
      sanitized.status = 'published';
      sanitized.version = (sanitized.version || 1) + 1;
      sanitized.updatedAt = new Date().toISOString();

      // Validate before publishing
      const val = PageSchemaValidator.validate(sanitized);
      if (!val.valid) {
        console.error('Validation failed during publish:', val.errors);
        return false;
      }

      localStorage.setItem(`${PUBLISHED_KEY_PREFIX}${page.id}`, JSON.stringify(sanitized));
      localStorage.setItem(`${DRAFT_KEY_PREFIX}${page.id}`, JSON.stringify(sanitized));
      this.pushHistory(sanitized);
      return true;
    } catch (e) {
      console.error('Failed to publish page:', e);
      return false;
    }
  }

  public static loadPublished(pageId: string): PageSchema | null {
    try {
      const raw = localStorage.getItem(`${PUBLISHED_KEY_PREFIX}${pageId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const val = PageSchemaValidator.validate(parsed);
      return val.valid ? (parsed as PageSchema) : null;
    } catch (e) {
      console.error('Failed to load published page:', e);
      return null;
    }
  }

  public static pushHistory(page: PageSchema): void {
    try {
      const key = `${HISTORY_KEY_PREFIX}${page.id}`;
      const existingStr = localStorage.getItem(key);
      const history: PageSchema[] = existingStr ? JSON.parse(existingStr) : [];
      // Keep up to 10 historical snapshots
      history.unshift({ ...page });
      if (history.length > 10) {
        history.pop();
      }
      localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history:', e);
    }
  }

  public static getHistory(pageId: string): PageSchema[] {
    try {
      const key = `${HISTORY_KEY_PREFIX}${pageId}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  public static exportJson(page: PageSchema): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(page, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${page.id}_v${page.version}_${page.status}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

