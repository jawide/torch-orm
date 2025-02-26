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

  async create(data: T): Promise<T> {
    await this.adapter.create<T>(this.collection, data);
    return data;
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

  async get<K extends keyof T>(id: K): Promise<T[K]> {
    const results = await this.adapter.find(this.collection, {
      where: { [this.idAttribute]: id },
    });
    return (results[0] as any)?.value;
  }

  async set<K extends keyof T>(id: K, value: T[K]): Promise<T[K]> {
    await this.delete({ where: { [this.idAttribute]: id } as any });
    await this.adapter.create(this.collection, { [this.idAttribute]: id, value });
    return value;
  }
}
