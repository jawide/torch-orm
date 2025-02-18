import { Entity } from './Entity';
import { Query } from './Query';

export interface DataAdapter {
  idAttribute: string;
  find<T extends Entity>(collection: string, query: Query): Promise<T[]>;
  create<T extends Entity>(collection: string, data: T): Promise<T>;
  update<T extends Entity>(collection: string, id: string | number, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string | number): Promise<void>;
  clear(collection: string): Promise<void>;
} 