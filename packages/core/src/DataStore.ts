import { DataAdapter } from "./DataAdapter";
import { Query } from "./Query";

export interface DataStoreOptions {
  adapter: DataAdapter;
  collection: string;
  idAttribute?: string;
}

export class DataStore<T> {
  public adapter: DataAdapter;
  public collection: string;
  public idAttribute: string;

  constructor(options: DataStoreOptions) {
    this.adapter = options.adapter;
    this.collection = options.collection;
    this.idAttribute = options.idAttribute || "id";
    this.adapter.idAttribute = this.idAttribute;
  }

  async find(query: Query = {}): Promise<T[]> {
    return this.adapter.find<T>(this.collection, query);
  }

  async create(data: T): Promise<T> {
    return this.adapter.create<T>(this.collection, data);
  }

  async update(query: Query, data: Partial<T>): Promise<T> {
    return this.adapter.update<T>(this.collection, query, data);
  }

  async delete(query: Query): Promise<void> {
    return this.adapter.delete(this.collection, query);
  }

  async clear(): Promise<void> {
    return this.adapter.clear(this.collection);
  }

  async get(id: string | number): Promise<T> {
    const results = await this.adapter.find<T>(this.collection, {
      [this.idAttribute]: id,
    });
    return results[0];
  }

  async set(id: string | number, data: T): Promise<T> {
    return this.adapter.update<T>(
      this.collection,
      {
        [this.idAttribute]: id,
      },
      data
    );
  }
}
