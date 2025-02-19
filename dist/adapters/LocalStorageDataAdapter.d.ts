import { KeyValueDataAdapter } from "./KeyValueDataAdapter";
export interface LocalStorageDataAdapterOptions {
    prefix?: string;
    storage?: Storage;
}
export declare class LocalStorageDataAdapter extends KeyValueDataAdapter {
    private prefix;
    private storage;
    constructor(options?: LocalStorageDataAdapterOptions);
    private getCollectionKey;
    protected getCollection<T extends Record<string, any>>(collection: string): Map<string | number, T>;
    protected saveCollection<T extends Record<string, any>>(collection: string, data: Map<string | number, T>): void;
    clear(collection: string): Promise<void>;
}
