import { DataAdapter, Entity, Query } from '../types';

/**
 * 键值数据库适配器的抽象基类
 * 实现了基于键值存储的通用查询、排序和过滤逻辑
 */
export abstract class KeyValueDataAdapter implements DataAdapter {
  /**
   * 从存储中获取指定集合的所有实体
   * @param collection 集合名称
   */
  protected abstract getCollection<T extends Entity>(collection: string): Map<string | number, T>;

  /**
   * 将实体集合保存到存储中
   * @param collection 集合名称
   * @param data 实体集合
   */
  protected abstract saveCollection<T extends Entity>(collection: string, data: Map<string | number, T>): void;

  /**
   * 过滤实体列表
   * @param entities 实体列表
   * @param query 查询条件
   */
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