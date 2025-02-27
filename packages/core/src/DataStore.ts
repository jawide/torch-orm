import { DataAdapter } from "./DataAdapter";
import { Query } from "./Query";

type KeyOf<T> = unknown extends T ? unknown : keyof T;
type ValueOf<T> = unknown extends T ? unknown : T[keyof T];

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

  async find(query?: Query<T>): Promise<T[]> {
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

  async get(id: KeyOf<T>): Promise<ValueOf<T>> {
    const results = await this.adapter.find(this.collection, {
      where: { [this.idAttribute]: id },
    });
    return (results[0] as any)?.value;
  }

  async set(id: KeyOf<T>, value: ValueOf<T>): Promise<ValueOf<T>> {
    await this.delete({ where: { [this.idAttribute]: id } as any });
    await this.adapter.create(this.collection, { [this.idAttribute]: id, value });
    return value;
  }

  async exists(query?: Query<T>): Promise<boolean> {
    return (await this.find(query)).length > 0;
  }
}
