import { DataAdapter } from './DataAdapter';
import { Entity } from './Entity';
import { Query } from './Query';

export interface DataStoreOptions {
  adapter: DataAdapter;
  idAttribute?: string;
}

export class DataStore<T extends Entity> {
  private adapter: DataAdapter;
  private collection: string;

  constructor(collection: string, options: DataStoreOptions) {
    this.adapter = options.adapter;
    this.collection = collection;
    this.adapter.idAttribute = options.idAttribute || "id";
  }

  async find(query: Query = {}): Promise<T[]> {
    return this.adapter.find<T>(this.collection, query);
  }

  async create(data: T): Promise<T> {
    return this.adapter.create<T>(this.collection, data);
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    return this.adapter.update<T>(this.collection, id, data);
  }

  async delete(id: string | number): Promise<void> {
    return this.adapter.delete(this.collection, id);
  }

  async clear(): Promise<void> {
    return this.adapter.clear(this.collection);
  }
} 