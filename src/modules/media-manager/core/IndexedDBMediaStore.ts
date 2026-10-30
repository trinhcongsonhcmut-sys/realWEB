const DB_NAME = 'RealWebMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

export class IndexedDBMediaStore {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.openDB();
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e: any) => {
        const db = e.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (e: any) => {
        resolve(e.target.result);
      };

      request.onerror = (e) => {
        console.error('IndexedDB open failed:', e);
        reject(e);
      };
    });
  }

  public async saveBlob(id: string, fileOrBlob: Blob): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id, data: fileOrBlob });
      req.onsuccess = () => resolve();
      req.onerror = (err) => reject(err);
    });
  }

  public async getBlob(id: string): Promise<Blob | null> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data);
        } else {
          resolve(null);
        }
      };
      req.onerror = (err) => reject(err);
    });
  }

  public async deleteBlob(id: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = (err) => reject(err);
    });
  }
}

