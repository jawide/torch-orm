import { DataAdapter, Entity, Query } from '../types';

export class MapDataAdapter implements DataAdapter {
  private storage: Map<string, Map<string | number, Entity>>;

  constructor() {
    this.storage = new Map();
  }

  private getCollection(name: string): Map<string | number, Entity> {
    let collection = this.storage.get(name);
    if (!collection) {
      collection = new Map();
      this.storage.set(name, collection);
    }
    return collection;
  }

  private filterEntities<T extends Entity>(entities: T[], query: Query): T[] {
    let result = entities;

    if (query.where) {
      result = result.filter(entity => {
        return Object.entries(query.where || {}).every(([key, value]) => entity[key] === value);
      });
    }

    if (query.sort) {
      result = [...result].sort((a, b) => {
        for (const [field, order] of query.sort || []) {
          if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
          if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    if (query.offset) {
      result = result.slice(query.offset);
    }

    if (query.limit) {
      result = result.slice(0, query.limit);
    }

    return result;
  }

  async find<T extends Entity>(collection: string, query: Query): Promise<T[]> {
    const entities = Array.from(this.getCollection(collection).values()) as T[];
    return this.filterEntities(entities, query);
  }

  async create<T extends Entity>(collection: string, data: T): Promise<T> {
    if (!data.id) {
      throw new Error('Entity must have an id');
    }
    const id = String(data.id);
    this.getCollection(collection).set(id, data);
    return data;
  }

  async update<T extends Entity>(collection: string, id: string | number, data: Partial<T>): Promise<T> {
    const entities = this.getCollection(collection);
    const strId = String(id);
    const existing = entities.get(strId) as T;
    if (!existing) {
      throw new Error('Entity not found');
    }
    const updated = { ...existing, ...data };
    entities.set(strId, updated);
    return updated;
  }

  async delete(collection: string, id: string | number): Promise<void> {
    const entities = this.getCollection(collection);
    entities.delete(String(id));
  }

  async clear(collection: string): Promise<void> {
    this.storage.delete(collection);
  }
} 