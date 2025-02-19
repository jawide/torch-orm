import { DataAdapter } from '../DataAdapter';
import { Query } from '../Query';
export declare abstract class KeyValueDataAdapter implements DataAdapter {
    idAttribute: string;
    protected abstract getCollection<T extends Record<string, any>>(collection: string): Map<string | number, T>;
    protected abstract saveCollection<T extends Record<string, any>>(collection: string, data: Map<string | number, T>): void;
    private filterEntities;
    find<T extends Record<string, any>>(collection: string, query: Query): Promise<T[]>;
    create<T extends Record<string, any>>(collection: string, data: T): Promise<T>;
    update<T extends Record<string, any>>(collection: string, id: string | number, data: Partial<T>): Promise<T>;
    delete(collection: string, id: string | number): Promise<void>;
    clear(collection: string): Promise<void>;
}
