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

  async find(query: Query<T> = {}): Promise<T[]> {
    return this.adapter.find<T>(this.collection, query);
  }

  async create(data: T): Promise<void> {
    await this.adapter.create<T>(this.collection, data);
  }

  async update(query: Query<T>, data: Partial<T>): Promise<void> {
    await this.adapter.update<T>(this.collection, query, data);
  }

  async delete(query: Query<T>): Promise<void> {
    await this.adapter.delete(this.collection, query);
  }

  async clear(): Promise<void> {
    return this.adapter.clear(this.collection);
  }

  async get(id: string): Promise<T> {
    const results = await this.adapter.find<T>(this.collection, {
      [this.idAttribute]: id,
    });
    return results[0];
  }

  async set(id: string, data: T): Promise<void> {
    await this.adapter.update<T>(
      this.collection,
      {
        [this.idAttribute]: id,
      },
      data
    );
  }
}
