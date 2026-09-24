// 测试 count 方法

import { DataStore, MapDataAdapter } from "@torch-orm/core";

const adapter = new MapDataAdapter();
const store = new DataStore({ adapter, collection: "test" });

describe("count", () => {
  beforeEach(async () => {
    await store.clear();
  });

  it("empty count return 0", async () => {
    expect(await store.count()).toBe(0);
  });

  it("count all entities", async () => {
    await store.create({ id: 1, name: "user1" });
    await store.create({ id: 2, name: "user2" });
    expect(await store.count()).toBe(2);
  });

  it("count entities matching where clause", async () => {
    await store.create({ id: 1, name: "user1" });
    await store.create({ id: 2, name: "user2" });
    expect(await store.count({ where: { name: "user1" } })).toBe(1);
  });

  it("count non-existent entity", async () => {
    expect(await store.count({ where: { id: 999 } })).toBe(0);
  });
});
