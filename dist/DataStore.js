export class DataStore {
    constructor(collection, options) {
        this.adapter = options.adapter;
        this.collection = collection;
        this.adapter.idAttribute = options.idAttribute || "id";
    }
    async find(query = {}) {
        return this.adapter.find(this.collection, query);
    }
    async create(data) {
        return this.adapter.create(this.collection, data);
    }
    async update(id, data) {
        return this.adapter.update(this.collection, id, data);
    }
    async delete(id) {
        return this.adapter.delete(this.collection, id);
    }
    async clear() {
        return this.adapter.clear(this.collection);
    }
}
