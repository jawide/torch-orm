export class KeyValueDataAdapter {
    constructor() {
        this.idAttribute = 'id';
    }
    filterEntities(entities, query) {
        let result = entities;
        if (query.where) {
            result = result.filter(entity => {
                return Object.entries(query.where || {}).every(([key, value]) => entity[key] === value);
            });
        }
        if (query.sort) {
            result = [...result].sort((a, b) => {
                for (const [field, order] of query.sort || []) {
                    if (a[field] < b[field])
                        return order === 'asc' ? -1 : 1;
                    if (a[field] > b[field])
                        return order === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        if (query.offset) {
            result = result.slice(query.offset);
        }
        if (query.limit) {
            result = result.slice(0, query.limit);
        }
        return result;
    }
    async find(collection, query) {
        const entities = Array.from(this.getCollection(collection).values());
        return this.filterEntities(entities, query);
    }
    async create(collection, data) {
        const id = data[this.idAttribute];
        if (!id) {
            throw new Error(`Entity must have an ${this.idAttribute}`);
        }
        const entities = this.getCollection(collection);
        entities.set(String(id), data);
        this.saveCollection(collection, entities);
        return data;
    }
    async update(collection, id, data) {
        const entities = this.getCollection(collection);
        const strId = String(id);
        const existing = entities.get(strId);
        if (!existing) {
            throw new Error('Entity not found');
        }
        const updated = { ...existing, ...data };
        entities.set(strId, updated);
        this.saveCollection(collection, entities);
        return updated;
    }
    async delete(collection, id) {
        const entities = this.getCollection(collection);
        entities.delete(String(id));
        this.saveCollection(collection, entities);
    }
    async clear(collection) {
        this.saveCollection(collection, new Map());
    }
}
