import { DataAdapter } from './DataAdapter';
import { Query } from './Query';
export interface DataStoreOptions {
    adapter: DataAdapter;
    idAttribute?: string;
}
export declare class DataStore<T extends Record<string, any>> {
    private adapter;
    private collection;
    constructor(collection: string, options: DataStoreOptions);
    find(query?: Query): Promise<T[]>;
    create(data: T): Promise<T>;
    update(id: string | number, data: Partial<T>): Promise<T>;
    delete(id: string | number): Promise<void>;
    clear(): Promise<void>;
}
