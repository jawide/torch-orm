import { DataAdapter, Entity, Query } from './types';

export class DataStore<T extends Entity> {
  private adapter: DataAdapter;
  private collection: string;

  constructor(adapter: DataAdapter, collection: string) {
    this.adapter = adapter;
    this.collection = collection;
  }

  async find(query: Query = {}): Promise<T[]> {
    return this.adapter.find<T>(this.collection, query);
  }

  async findOne(id: string | number): Promise<T | null> {
    return this.adapter.findOne<T>(this.collection, id);
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