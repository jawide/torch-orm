import { DataStore } from '../DataStore';
import { MapDataAdapter } from '../adapters/MapDataAdapter';
import { Entity } from '../types';

interface User extends Entity {
  id: number;
  name: string;
  age: number;
}

describe('DataStore', () => {
  let store: DataStore<User>;
  let adapter: MapDataAdapter;

  beforeEach(() => {
    adapter = new MapDataAdapter();
    store = new DataStore<User>(adapter, 'users');
  });

  const testUser: User = {
    id: 1,
    name: 'John Doe',
    age: 30
  };

  it('should create an entity', async () => {
    const created = await store.create(testUser);
    expect(created).toEqual(testUser);
  });

  it('should update an entity', async () => {
    await store.create(testUser);
    const updated = await store.update(1, { age: 31 });
    expect(updated).toEqual({ ...testUser, age: 31 });
  });

  it('should delete an entity', async () => {
    await store.create(testUser);
    await store.delete(1);
    const results = await store.find({ where: { id: 1 } });
    expect(results).toHaveLength(0);
  });

  it('should find entities with query', async () => {
    await store.create(testUser);
    await store.create({ id: 2, name: 'Jane Doe', age: 25 });

    const results = await store.find({ where: { age: 30 } });
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(testUser);
  });

  it('should sort entities', async () => {
    await store.create(testUser);
    await store.create({ id: 2, name: 'Jane Doe', age: 25 });

    const results = await store.find({ sort: [['age', 'desc']] });
    expect(results).toHaveLength(2);
    expect(results[0].age).toBe(30);
    expect(results[1].age).toBe(25);
  });

  it('should limit and offset results', async () => {
    await store.create(testUser);
    await store.create({ id: 2, name: 'Jane Doe', age: 25 });
    await store.create({ id: 3, name: 'Bob Smith', age: 35 });

    const results = await store.find({ limit: 2, offset: 1 });
    expect(results).toHaveLength(2);
  });

  it('should clear all entities', async () => {
    await store.create(testUser);
    await store.create({ id: 2, name: 'Jane Doe', age: 25 });
    
    await store.clear();
    const results = await store.find();
    expect(results).toHaveLength(0);
  });
}); 