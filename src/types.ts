export interface Entity {
  id: string | number;
  [key: string]: any;
}

export interface Query {
  where?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort?: Array<[string, 'asc' | 'desc']>;
}

export interface DataAdapter {
  find<T extends Entity>(collection: string, query: Query): Promise<T[]>;
  findOne<T extends Entity>(collection: string, id: string | number): Promise<T | null>;
  create<T extends Entity>(collection: string, data: T): Promise<T>;
  update<T extends Entity>(collection: string, id: string | number, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string | number): Promise<void>;
  clear(collection: string): Promise<void>;
} 