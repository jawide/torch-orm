import { DataAdapter } from "./DataAdapter";
import { Query } from "./Query";

export abstract class KeyValueDataAdapter implements DataAdapter {
  public idAttribute: string = "id";

  public abstract getValue<T>(key: string): Promise<T>;
  public abstract setValue<T>(key: string, value: T): Promise<void>;
  public abstract removeValue(key: string): Promise<void>;
  public abstract getIndex(key: string): Promise<string[]>;
  public abstract setIndex(key: string, value: string[]): Promise<void>;
  public abstract removeIndex(key: string): Promise<void>;

  public getKey(collection: string, id: string): string {
    return `${collection}:item:${id}`;
  }

  public getIndexKey(collection: string): string {
    return `${collection}:index`;
  }

  public filterEntities<T>(entities: T[], query?: Query<T>): T[] {
    let result = entities;

    if (query?.where) {
      result = result.filter((entity) => {
        return Object.entries(query.where as any).every(([key, value]) => (entity as any)[key] === value);
      });
    }

    if (query?.sort) {
      result = result.sort((a, b) => {
        for (const [field, order] of Object.entries(query.sort ?? {})) {
          if ((a as any)[field] < (b as any)[field]) return order === "asc" ? -1 : 1;
          if ((a as any)[field] > (b as any)[field]) return order === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }

  public async loadEntities<T>(collection: string, query?: Query<T>): Promise<T[]> {
    const where = query?.where;
    if (Object.keys(where ?? {}).length === 1 && (where as any)[this.idAttribute]) {
      const entity = await this.getValue<T>(this.getKey(collection, (where as any)[this.idAttribute]));
      return entity ? [entity] : [];
    }
    const index = await this.getIndex(this.getIndexKey(collection));
    return Promise.all(index.map((id) => this.getValue<T>(this.getKey(collection, id))));
  }

  public async find<T>(collection: string, query?: Query<T>): Promise<T[]> {
    const result = this.filterEntities(await this.loadEntities(collection, query), query);
    const offset = query?.offset ?? 0;
    return query?.limit === undefined ? result.slice(offset) : result.slice(offset, offset + query.limit);
  }

  public async count<T>(collection: string, query?: Query<T>): Promise<number> {
    const where = query?.where;
    if (Object.keys(where ?? {}).length === 1 && (where as any)[this.idAttribute]) {
      return (await this.getValue(this.getKey(collection, (where as any)[this.idAttribute]))) ? 1 : 0;
    }
    return this.filterEntities(await this.loadEntities(collection, query), query).length;
  }

  public async create<T>(collection: string, data: T): Promise<void> {
    const id = (data as any)[this.idAttribute];
    if (!id) {
      throw new Error(`Entity must have an ${this.idAttribute}`);
    }
    const index = await this.getIndex(this.getIndexKey(collection));
    if (index.includes(id)) {
      throw new Error("Entity create failed");
    }
    index.push(id);
    await this.setIndex(this.getIndexKey(collection), index);
    await this.setValue(this.getKey(collection, id), data);
  }

  public async update<T>(collection: string, query: Query<T>, data: Partial<T>): Promise<void> {
    if (Object.keys(query?.where ?? {}).length === 0) {
      throw new Error(`Entity update requires a where clause, use clear() to remove all`);
    }
    const entities = this.filterEntities(await this.loadEntities(collection, query), query);
    for (const entity of entities) {
      const id = (entity as any)[this.idAttribute];
      if (!id) {
        throw new Error(`Entity must have an ${this.idAttribute}`);
      }
      await this.setValue(this.getKey(collection, id), { ...entity, ...data });
    }
  }

  public async delete(collection: string, query: Query<any>): Promise<void> {
    if (Object.keys(query?.where ?? {}).length === 0) {
      throw new Error(`Entity delete requires a where clause, use clear() to remove all`);
    }
    const index = await this.getIndex(this.getIndexKey(collection));
    const entities = this.filterEntities(await this.loadEntities(collection, query), query);
    for (const entity of entities) {
      const id = (entity as any)[this.idAttribute];
      if (!id) {
        throw new Error(`Entity must have an ${this.idAttribute}`);
      }
      await this.removeValue(this.getKey(collection, id));
    }
    await this.setIndex(
      this.getIndexKey(collection),
      index.filter((id) => !entities.some((entity) => (entity as any)[this.idAttribute] === id))
    );
  }

  public async clear(collection: string): Promise<void> {
    const index = await this.getIndex(this.getIndexKey(collection));
    await Promise.all(index.map((id) => this.removeValue(this.getKey(collection, id))));
    await this.removeIndex(this.getIndexKey(collection));
  }
}
