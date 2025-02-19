import { KeyValueDataAdapter } from "./KeyValueDataAdapter";
export class MapDataAdapter extends KeyValueDataAdapter {
    constructor(options = {}) {
        super();
        this.storage = options.initialData || new Map();
    }
    getCollection(collection) {
        let data = this.storage.get(collection);
        if (!data) {
            data = new Map();
            this.storage.set(collection, data);
        }
        return data;
    }
    saveCollection(collection, data) {
        if (data.size === 0) {
            this.storage.delete(collection);
        }
        else {
            this.storage.set(collection, data);
        }
    }
}
