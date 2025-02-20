// 测试 get 和 set 方法

import { DataStore, MapDataAdapter } from "@torch-orm/core";

const adapter = new MapDataAdapter();
const store = new DataStore({ adapter, collection: "test" });

test("get", async () => {
  const result = await store.get("enable");
  expect(result).toBe(undefined);
});

test("set boolean", async () => {
  await store.set("enable", true);
  const result = await store.get("enable");
  expect(result).toEqual(true);
});

test("set number", async () => {
  await store.set("count", 10);
  const result = await store.get("count");
  expect(result).toEqual(10);
});

test("set string", async () => {
  await store.set("name", "test");
  const result = await store.get("name");
  expect(result).toEqual("test");
});

test("set object", async () => {
  await store.set("user", { name: "test", age: 10 });
  const result = await store.get("user");
  expect(result).toEqual({ name: "test", age: 10 });
});

test("set array", async () => {
  await store.set("list", [1, 2, 3]);
  const result = await store.get("list");
  expect(result).toEqual([1, 2, 3]);
});
