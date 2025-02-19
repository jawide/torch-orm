import { KeyValueDataAdapter } from "./KeyValueDataAdapter";
export class LocalStorageDataAdapter extends KeyValueDataAdapter {
    constructor(options = {}) {
        super();
        this.prefix = options.prefix || "torch-orm:";
        this.storage = options.storage || localStorage;
    }
    getCollectionKey(collection) {
        return `${this.prefix}${collection}`;
    }
    getCollection(collection) {
        const data = this.storage.getItem(this.getCollectionKey(collection));
        if (!data) {
            return new Map();
        }
        try {
            const parsed = JSON.parse(data);
            return new Map(Object.entries(parsed));
        }
        catch {
            return new Map();
        }
    }
    saveCollection(collection, data) {
        if (data.size === 0) {
            this.storage.removeItem(this.getCollectionKey(collection));
        }
        else {
            this.storage.setItem(this.getCollectionKey(collection), JSON.stringify(Object.fromEntries(data)));
        }
    }
    async clear(collection) {
        this.storage.removeItem(this.getCollectionKey(collection));
    }
}
