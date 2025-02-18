import { DataAdapter } from '../DataAdapter';
import { Entity } from '../Entity';
import { Query } from '../Query';

export abstract class KeyValueDataAdapter implements DataAdapter {
  protected abstract getCollection<T extends Entity>(collection: string): Map<string | number, T>;
  protected abstract saveCollection<T extends Entity>(collection: string, data: Map<string | number, T>): void;

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
    entities.set(String(data.id), data);
    this.saveCollection(collection, entities);
    return data;
  }

  async update<T extends Entity>(collection: string, id: string | number, data: Partial<T>): Promise<T> {
    const entities = this.getCollection<T>(collection);
    const strId = String(id);
    const existing = entities.get(strId);
    if (!existing) {
      throw new Error('Entity not found');
    }
    const updated = { ...existing, ...data };
    entities.set(strId, updated);
    this.saveCollection(collection, entities);
    return updated;
  }

  async delete(collection: string, id: string | number): Promise<void> {
    const entities = this.getCollection(collection);
    entities.delete(String(id));
    this.saveCollection(collection, entities);
  }

  async clear(collection: string): Promise<void> {
    this.saveCollection(collection, new Map());
  }
} 