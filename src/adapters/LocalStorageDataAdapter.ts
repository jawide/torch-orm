import { DataAdapter, Entity, Query } from '../types';

export class LocalStorageDataAdapter implements DataAdapter {
  private prefix: string;

  constructor(prefix: string = 'torch-orm:') {
    this.prefix = prefix;
  }

  private getCollectionKey(collection: string): string {
    return `${this.prefix}${collection}`;
  }

  private getCollection<T extends Entity>(collection: string): Map<string | number, T> {
    const data = localStorage.getItem(this.getCollectionKey(collection));
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

  private saveCollection<T extends Entity>(collection: string, data: Map<string | number, T>): void {
    if (data.size === 0) {
      localStorage.removeItem(this.getCollectionKey(collection));
    } else {
      localStorage.setItem(
        this.getCollectionKey(collection),
        JSON.stringify(Object.fromEntries(data))
      );
    }
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
    const entities = Array.from(this.getCollection<T>(collection).values());
    return this.filterEntities(entities, query);
  }

  async create<T extends Entity>(collection: string, data: T): Promise<T> {
    if (!data.id) {
      throw new Error('Entity must have an id');
    }
    const entities = this.getCollection<T>(collection);
    entities.set(data.id, data);
    this.saveCollection(collection, entities);
    return data;
  }

  async update<T extends Entity>(collection: string, id: string | number, data: Partial<T>): Promise<T> {
    const entities = this.getCollection<T>(collection);
    const existing = entities.get(String(id));
    if (!existing) {
      throw new Error('Entity not found');
    }
    const updated = { ...existing, ...data };
    entities.set(String(id), updated);
    this.saveCollection(collection, entities);
    return updated;
  }

  async delete(collection: string, id: string | number): Promise<void> {
    const entities = this.getCollection(collection);
    entities.delete(String(id));
    this.saveCollection(collection, entities);
  }

  async clear(collection: string): Promise<void> {
    localStorage.removeItem(this.getCollectionKey(collection));
  }
} 