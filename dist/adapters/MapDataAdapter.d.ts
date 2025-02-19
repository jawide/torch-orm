import { KeyValueDataAdapter } from "./KeyValueDataAdapter";
export interface MapDataAdapterOptions {
    initialData?: Map<string, Map<string | number, Record<string, any>>>;
}
export declare class MapDataAdapter extends KeyValueDataAdapter {
    private storage;
    constructor(options?: MapDataAdapterOptions);
    protected getCollection<T extends Record<string, any>>(collection: string): Map<string | number, T>;
    protected saveCollection<T extends Record<string, any>>(collection: string, data: Map<string | number, T>): void;
}
