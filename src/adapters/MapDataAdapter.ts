import { Entity } from '../Entity';
import { KeyValueDataAdapter } from './KeyValueDataAdapter';

export interface MapDataAdapterOptions {
  initialData?: Map<string, Map<string | number, Entity>>;
}

export class MapDataAdapter extends KeyValueDataAdapter {
  private storage: Map<string, Map<string | number, Entity>>;

  constructor(options: MapDataAdapterOptions = {}) {
    super();
    this.storage = options.initialData || new Map();
  }

  protected getCollection<T extends Entity>(collection: string): Map<string | number, T> {
    let data = this.storage.get(collection);
    if (!data) {
      data = new Map();
      this.storage.set(collection, data);
    }
    return data as Map<string | number, T>;
  }

  protected saveCollection<T extends Entity>(collection: string, data: Map<string | number, T>): void {
    if (data.size === 0) {
      this.storage.delete(collection);
    } else {
      this.storage.set(collection, data);
    }
  }
} 