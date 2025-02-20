import { KeyValueDataAdapter } from "./KeyValueDataAdapter";

export interface MapDataAdapterOptions {
  initialData?: Map<string, any>;
}

export class MapDataAdapter extends KeyValueDataAdapter {
  public storage: Map<string, any>;

  constructor(options: MapDataAdapterOptions = {}) {
    super();
    this.storage = options.initialData || new Map();
  }

  public async getValue<T>(key: string): Promise<T> {
    return this.storage.get(key) as T;
  }
  public async setValue<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }
  public async removeValue(key: string): Promise<void> {
    this.storage.delete(key);
  }
  public async getIndex(key: string): Promise<string[]> {
    return this.storage.get(key) ?? [];
  }
  public async setIndex(key: string, value: string[]): Promise<void> {
    this.storage.set(key, value);
  }
  public async removeIndex(key: string): Promise<void> {
    this.storage.delete(key);
  }
}
