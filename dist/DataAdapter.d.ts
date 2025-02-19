import { Query } from "./Query";
export interface DataAdapter {
    idAttribute: string;
    find<T extends Record<string, any>>(collection: string, query: Query): Promise<T[]>;
    create<T extends Record<string, any>>(collection: string, data: T): Promise<T>;
    update<T extends Record<string, any>>(collection: string, id: string | number, data: Partial<T>): Promise<T>;
    delete(collection: string, id: string | number): Promise<void>;
    clear(collection: string): Promise<void>;
}
