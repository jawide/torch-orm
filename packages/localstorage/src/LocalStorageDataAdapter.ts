import { KeyValueDataAdapter } from "@torch-orm/core";

export interface LocalStorageDataAdapterOptions {
  prefix?: string;
  storage?: Storage;
}

export class LocalStorageDataAdapter extends KeyValueDataAdapter {
  public prefix: string;
  public storage: Storage;

  constructor(options: LocalStorageDataAdapterOptions = {}) {
    super();
    this.prefix = options.prefix || "torch-orm:";
    this.storage = options.storage || localStorage;
  }

  private getCollectionKey(collection: string): string {
    return `${this.prefix}${collection}`;
  }

  protected async getCollection<T extends Record<string, any>>(collection: string): Promise<Map<string | number, T>> {
    const data = this.storage.getItem(this.getCollectionKey(collection));
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

  protected async saveCollection<T extends Record<string, any>>(
    collection: string,
    data: Map<string | number, T>
  ): Promise<void> {
    if (data.size === 0) {
      this.storage.removeItem(this.getCollectionKey(collection));
    } else {
      this.storage.setItem(this.getCollectionKey(collection), JSON.stringify(Object.fromEntries(data)));
    }
  }

  async clear(collection: string): Promise<void> {
    this.storage.removeItem(this.getCollectionKey(collection));
  }
}
