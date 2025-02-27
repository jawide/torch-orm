// 测试 exists 方法

import { DataStore, MapDataAdapter } from "@torch-orm/core";

const adapter = new MapDataAdapter();
const store = new DataStore({ adapter, collection: "test" });

describe("exists", () => {
  beforeEach(async () => {
    await store.clear();
  });

  it("empty exists return false", async () => {
    const result = await store.exists();
    expect(result).toBe(false);
  });

  it("exists return true", async () => {
    await store.create({ id: 1, name: "user1" });
    await store.set("user", { name: "user", age: 10 });
    const result = await store.exists();
    expect(result).toBe(true);
  });
});
