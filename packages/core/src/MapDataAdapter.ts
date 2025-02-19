import { KeyValueDataAdapter } from "./KeyValueDataAdapter";

export interface MapDataAdapterOptions {
  initialData?: Map<string, Map<string | number, Record<string, any>>>;
}

export class MapDataAdapter extends KeyValueDataAdapter {
  public storage: Map<string, Map<string | number, Record<string, any>>>;

  constructor(options: MapDataAdapterOptions = {}) {
    super();
    this.storage = options.initialData || new Map();
  }

  protected getCollection<T extends Record<string, any>>(collection: string): Map<string | number, T> {
    let data = this.storage.get(collection);
    if (!data) {
      data = new Map();
      this.storage.set(collection, data);
    }
    return data as Map<string | number, T>;
  }

  protected saveCollection<T extends Record<string, any>>(collection: string, data: Map<string | number, T>): void {
    if (data.size === 0) {
      this.storage.delete(collection);
    } else {
      this.storage.set(collection, data);
    }
  }
}
