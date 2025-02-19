import { DataAdapter } from "@torch-orm/core";

interface TestUser {
  id: number;
  name: string;
  age: number;
}

const testUser: TestUser = {
  id: 1,
  name: "John Doe",
  age: 30,
};

export function runAdapterTests(
  adapterName: string,
  createAdapter: () => DataAdapter,
  beforeEachCallback?: () => void | Promise<void>,
  afterAllCallback?: () => void | Promise<void>
) {
  describe(adapterName, () => {
    let adapter: DataAdapter;

    beforeEach(async () => {
      adapter = createAdapter();
      if (beforeEachCallback) {
        await beforeEachCallback();
      }
    });

    if (afterAllCallback) {
      afterAll(async () => {
        await afterAllCallback();
      });
    }

    describe("create", () => {
      it("should create an entity", async () => {
        const created = await adapter.create("users", testUser);
        expect(created).toEqual(testUser);
      });

      it("should throw error when creating entity without id", async () => {
        const invalidUser = { name: "John Doe", age: 30 } as TestUser;
        await expect(adapter.create("users", invalidUser)).rejects.toThrow("Entity must have an id");
      });
    });

    describe("find", () => {
      beforeEach(async () => {
        await adapter.create("users", testUser);
        await adapter.create("users", { id: 2, name: "Jane Doe", age: 25 });
        await adapter.create("users", { id: 3, name: "Bob Smith", age: 35 });
      });

      it("should find all entities without query", async () => {
        const results = await adapter.find("users", {});
        expect(results).toHaveLength(3);
      });

      it("should find entities with where clause", async () => {
        const results = await adapter.find("users", { where: { age: 30 } });
        expect(results).toHaveLength(1);
        expect(results[0]).toEqual(testUser);
      });

      it("should find entities with multiple where conditions", async () => {
        const results = await adapter.find("users", { where: { age: 30, name: "John Doe" } });
        expect(results).toHaveLength(1);
        expect(results[0]).toEqual(testUser);
      });

      it("should sort entities", async () => {
        const results = await adapter.find("users", { sort: [["age", "desc"]] });
        expect(results).toHaveLength(3);
        expect(results[0].age).toBe(35);
        expect(results[1].age).toBe(30);
        expect(results[2].age).toBe(25);
      });

      it("should limit results", async () => {
        const results = await adapter.find("users", { limit: 2 });
        expect(results).toHaveLength(2);
      });

      it("should offset results", async () => {
        const results = await adapter.find("users", { offset: 1 });
        expect(results).toHaveLength(2);
      });

      it("should combine limit and offset", async () => {
        const results = await adapter.find("users", { limit: 1, offset: 1 });
        expect(results).toHaveLength(1);
      });
    });

    describe("update", () => {
      beforeEach(async () => {
        await adapter.create("users", testUser);
      });

      it("should update an entity", async () => {
        const updated = await adapter.update("users", 1, { age: 31 });
        expect(updated).toEqual({ ...testUser, age: 31 });
      });

      it("should throw error when updating non-existent entity", async () => {
        await expect(adapter.update("users", 999, { age: 31 })).rejects.toThrow("Entity not found");
      });
    });

    describe("delete", () => {
      beforeEach(async () => {
        await adapter.create("users", testUser);
      });

      it("should delete an entity", async () => {
        await adapter.delete("users", 1);
        const results = await adapter.find("users", { where: { id: 1 } });
        expect(results).toHaveLength(0);
      });

      it("should not throw when deleting non-existent entity", async () => {
        await expect(adapter.delete("users", 999)).resolves.not.toThrow();
      });
    });

    describe("clear", () => {
      beforeEach(async () => {
        await adapter.create("users", testUser);
        await adapter.create("users", { id: 2, name: "Jane Doe", age: 25 });
      });

      it("should clear all entities in a collection", async () => {
        await adapter.clear("users");
        const results = await adapter.find("users", {});
        expect(results).toHaveLength(0);
      });

      it("should only clear specified collection", async () => {
        await adapter.create("posts", { id: 1, title: "Test Post" });
        await adapter.clear("users");
        const users = await adapter.find("users", {});
        const posts = await adapter.find("posts", {});
        expect(users).toHaveLength(0);
        expect(posts).toHaveLength(1);
      });
    });
  });
}
