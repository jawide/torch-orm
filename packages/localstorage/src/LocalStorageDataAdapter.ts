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

  public async getValue<T>(key: string): Promise<T> {
    return JSON.parse(this.storage.getItem(key) ?? "null") as T;
  }
  public async setValue<T>(key: string, value: T): Promise<void> {
    this.storage.setItem(key, JSON.stringify(value));
  }
  public async removeValue(key: string): Promise<void> {
    this.storage.removeItem(key);
  }
  public async getIndex(key: string): Promise<string[]> {
    return JSON.parse(this.storage.getItem(key) ?? "[]") as string[];
  }
  public async setIndex(key: string, value: string[]): Promise<void> {
    this.storage.setItem(key, JSON.stringify(value));
  }
  public async removeIndex(key: string): Promise<void> {
    this.storage.removeItem(key);
  }
}
