import { Query } from "./Query";

export interface DataAdapter {
  idAttribute: string;

  find<T>(collection: string, query?: Query<T>): Promise<T[]>;
  create<T>(collection: string, data: T): Promise<void>;
  update<T>(collection: string, query: Query<T>, data: Partial<T>): Promise<void>;
  delete<T>(collection: string, query: Query<T>): Promise<void>;
  clear(collection: string): Promise<void>;
}
