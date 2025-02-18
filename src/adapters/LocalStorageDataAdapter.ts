import { Entity } from '../types';
import { KeyValueDataAdapter } from './KeyValueDataAdapter';

export class LocalStorageDataAdapter extends KeyValueDataAdapter {
  private prefix: string;

  constructor(prefix: string = 'torch-orm:') {
    super();
    this.prefix = prefix;
  }

  private getCollectionKey(collection: string): string {
    return `${this.prefix}${collection}`;
  }

  protected getCollection<T extends Entity>(collection: string): Map<string | number, T> {
    const data = localStorage.getItem(this.getCollectionKey(collection));
    if (!data) {
      return new Map();
    }
    try {
      const parsed = JSON.parse(data);
      return new Map(Object.entries(parsed));
    } catch {
      return new Map();
    }
  }

  protected saveCollection<T extends Entity>(collection: string, data: Map<string | number, T>): void {
    if (data.size === 0) {
      localStorage.removeItem(this.getCollectionKey(collection));
    } else {
      localStorage.setItem(
        this.getCollectionKey(collection),
        JSON.stringify(Object.fromEntries(data))
      );
    }
  }

  async clear(collection: string): Promise<void> {
    localStorage.removeItem(this.getCollectionKey(collection));
  }
} 