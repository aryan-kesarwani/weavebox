//use to cache images from google drive
export interface CachedImage {
  id: string;
  name: string;
  blob: Blob;
  timestamp: number;
}

class ImageCacheDB {
  private dbName: string;
  private dbVersion: number;
  private storeName: string;
  private maxCacheAge: number; // In milliseconds
  private maxCacheSize: number; // In bytes
  
  constructor() {
    this.dbName = 'GoogleDriveImageCache';
    this.dbVersion = 1;
    this.storeName = 'images';
    this.maxCacheAge = 24 * 60 * 60 * 1000; // 1 day
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB
  }
  
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  async cacheImage(id: string, name: string, blob: Blob): Promise<void> {
    // Skip large images
    if (blob.size > 5 * 1024 * 1024) return;
    
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      
      await store.put({
        id,
        name,
        blob,
        timestamp: Date.now()
      });
      
      // Cleanup old cache entries
      this.cleanup();
    } catch (error) {
      console.warn('Failed to cache image:', error);
    }
  }
  
  async getImage(id: string): Promise<Blob | null> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
          const cachedImage = request.result as CachedImage;
          if (!cachedImage) {
            resolve(null);
            return;
          }
          
          // Check if the image is too old
          const now = Date.now();
          if (now - cachedImage.timestamp > this.maxCacheAge) {
            // Image is too old, delete it
            this.deleteImage(id);
            resolve(null);
            return;
          }
          
          resolve(cachedImage.blob);
        };
      });
    } catch (error) {
      console.warn('Failed to retrieve cached image:', error);
      return null;
    }
  }
  
  async deleteImage(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      
      await store.delete(id);
    } catch (error) {
      console.warn('Failed to delete cached image:', error);
    }
  }
  
  async cleanup(): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      
      const now = Date.now();
      let totalSize = 0;
      const toDelete: string[] = [];
      
      return new Promise((resolve, reject) => {
        const request = store.openCursor();
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            const cachedImage = cursor.value as CachedImage;
            
            // Check if image is too old
            if (now - cachedImage.timestamp > this.maxCacheAge) {
              toDelete.push(cachedImage.id);
            } else {
              totalSize += cachedImage.blob.size;
            }
            
            cursor.continue();
          } else {
            // If total size exceeds limit, delete older entries
            if (totalSize > this.maxCacheSize) {
              this.deleteOldestEntries(totalSize - this.maxCacheSize);
            }
            
            // Delete all marked entries
            Promise.all(toDelete.map(id => this.deleteImage(id)))
              .then(() => resolve())
              .catch(error => reject(error));
          }
        };
      });
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
  
  private async deleteOldestEntries(bytesToFree: number): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.openCursor();
        const entries: CachedImage[] = [];
        
        request.onerror = () => reject(request.error);
        
        // First collect all entries
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            entries.push(cursor.value as CachedImage);
            cursor.continue();
          } else {
            // Sort by timestamp (oldest first)
            entries.sort((a, b) => a.timestamp - b.timestamp);
            
            let freedBytes = 0;
            const toDelete: string[] = [];
            
            // Mark entries for deletion until we've freed enough space
            for (const entry of entries) {
              if (freedBytes >= bytesToFree) break;
              
              toDelete.push(entry.id);
              freedBytes += entry.blob.size;
            }
            
            // Delete marked entries
            Promise.all(toDelete.map(id => this.deleteImage(id)))
              .then(() => resolve())
              .catch(error => reject(error));
          }
        };
      });
    } catch (error) {
      console.warn('Failed to delete oldest cache entries:', error);
    }
  }
}

export const imageCacheDB = new ImageCacheDB();