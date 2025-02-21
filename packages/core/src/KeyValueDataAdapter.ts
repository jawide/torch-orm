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

    if (query?.limit) {
      result = result.slice(0, query.limit);
    }

    return result;
  }

  public async find<T>(collection: string, query?: Query<T>): Promise<T[]> {
    const index = await this.getIndex(collection);
    const whereLength = Object.keys(query?.where ?? {}).length;
    if (whereLength === 1 && (query!.where as any)[this.idAttribute]) {
      const id = (query!.where as any)[this.idAttribute];
      const entity = await this.getValue<T>(this.getKey(collection, id));
      if (entity) {
        return [entity];
      } else {
        return [];
      }
    } else {
      const entities = await Promise.all(index.map((id) => this.getValue<T>(this.getKey(collection, id))));
      return this.filterEntities(entities, query!);
    }
  }

  public async create<T>(collection: string, data: T): Promise<void> {
    const id = (data as any)[this.idAttribute];
    if (!id) {
      throw new Error(`Entity must have an ${this.idAttribute}`);
    }
    const index = await this.getIndex(collection);
    if (index.includes(id)) {
      throw new Error(`Entity with id ${id} already exists`);
    }
    index.push(id);
    await this.setIndex(collection, index);
    await this.setValue(this.getKey(collection, id), data);
  }

  public async update<T>(collection: string, query: Query<T>, data: Partial<T>): Promise<void> {
    const index = await this.getIndex(collection);
    const whereLength = Object.keys(query?.where ?? {}).length;
    if (whereLength == 1 && (query!.where as any)[this.idAttribute]) {
      const id = (query!.where as any)[this.idAttribute];
      let entity = await this.getValue<T>(this.getKey(collection, id));
      if (entity) {
        entity = { ...entity, ...data };
        await this.setValue(this.getKey(collection, id), entity);
      }
    } else {
      const entities = await Promise.all(index.map((id) => this.getValue<T>(this.getKey(collection, id))));
      const filteredEntities = this.filterEntities(entities, query);
      for (const entity of filteredEntities) {
        const id = (entity as any)[this.idAttribute];
        if (!id) {
          throw new Error(`Entity must have an ${this.idAttribute}`);
        }
        await this.setValue(this.getKey(collection, id), { ...entity, ...data });
      }
    }
  }

  public async delete(collection: string, query: Query<any>): Promise<void> {
    const index = await this.getIndex(collection);
    const whereLength = Object.keys(query?.where ?? {}).length;
    if (whereLength == 1 && (query!.where as any)[this.idAttribute]) {
      const id = (query!.where as any)[this.idAttribute];
      await this.removeValue(this.getKey(collection, id));
      await this.setIndex(
        collection,
        index.filter((id) => id !== id)
      );
    } else {
      const entities = await Promise.all(index.map((id) => this.getValue<any>(this.getKey(collection, id))));
      const filteredEntities = this.filterEntities(entities, query);
      for (const entity of filteredEntities) {
        const id = (entity as any)[this.idAttribute];
        if (!id) {
          throw new Error(`Entity must have an ${this.idAttribute}`);
        }
        await this.removeValue(this.getKey(collection, id));
      }
      await this.setIndex(
        collection,
        index.filter((id) => !filteredEntities.some((entity) => (entity as any)[this.idAttribute] === id))
      );
    }
  }

  public async clear(collection: string): Promise<void> {
    const index = await this.getIndex(collection);
    await Promise.all(index.map((id) => this.removeValue(this.getKey(collection, id))));
    await this.removeIndex(collection);
  }
}
