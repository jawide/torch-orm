import { Query } from "./Query";

export interface DataAdapter {
  idAttribute: string;
  find<T>(collection: string, query: Query): Promise<T[]>;
  create<T>(collection: string, data: T): Promise<T>;
  update<T>(collection: string, query: Query, data: Partial<T>): Promise<T>;
  delete(collection: string, query: Query): Promise<void>;
  clear(collection: string): Promise<void>;
}
