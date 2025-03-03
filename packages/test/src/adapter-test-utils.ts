import { DataAdapter } from "@torch-orm/core";
import { TestFunctions } from "./types";

interface TestUser {
  id: number;
  name: string;
  age: number;
}

interface TestPost {
  id: number;
  title: string;
}

const testUser: TestUser = {
  id: 1,
  name: "John Doe",
  age: 30,
};

const testPost: TestPost = {
  id: 1,
  title: "Test Post",
};

export function runAdapterTests(
  adapterName: string,
  createAdapter: () => DataAdapter,
  testFunctions: any,
  beforeEachCallback?: () => void | Promise<void>,
  afterAllCallback?: () => void | Promise<void>
) {
  const { describe, it, beforeEach, afterAll, expect } = testFunctions as TestFunctions;

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
        await adapter.create("users", testUser);
        const created = (await adapter.find<TestUser>("users", { where: { id: testUser.id } }))[0];
        expect(created).toEqual(testUser);
      });

      it("should throw error when creating entity without id", async () => {
        const invalidUser = { name: "John Doe", age: 30 } as TestUser;
        await expect(adapter.create("users", invalidUser)).rejects.toThrow("Entity must have an id");
      });

      it("should throw error when creating entity with same id", async () => {
        await adapter.create("users", testUser);
        await expect(adapter.create("users", testUser)).rejects.toThrow(/Entity create failed/);
      });

      it("should safe when creating entity with unexpected property", async () => {
        const invalidUser = { id: 2, name: "John Doe", age: 30, unknownProperty: "unknown" } as TestUser;
        await expect(adapter.create("users", invalidUser)).resolves.not.toThrow();
      });
    });

    describe("find", () => {
      beforeEach(async () => {
        await adapter.create("users", testUser);
        await adapter.create("users", { id: 2, name: "Jane Doe", age: 25 });
        await adapter.create("users", { id: 3, name: "Bob Smith", age: 35 });
      });

      it("should find specific entity", async () => {
        const results = await adapter.find("users", { where: { id: 3 } });
        expect(results).toHaveLength(1);
        expect(results[0]).toEqual({ id: 3, name: "Bob Smith", age: 35 });
      });

      it("should find all entities without query", async () => {
        const results = await adapter.find("users");
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
        const results = await adapter.find<TestUser>("users", { sort: { age: "desc" } });
        expect(results).toHaveLength(3);
        expect(results[0].age).toBe(35);
        expect(results[1].age).toBe(30);
        expect(results[2].age).toBe(25);
      });

      it("should limit results", async () => {
        const results = await adapter.find("users", { limit: 2 });
        expect(results).toHaveLength(2);
      });

      it("should safe when finding entity with unexpected property", async () => {
        expect(adapter.find("users", { where: { unknownProperty: "unknown" } })).resolves.not.toThrow();
      });
    });

    describe("update", () => {
      beforeEach(async () => {
        await adapter.create("users", testUser);
      });

      it("should update an entity", async () => {
        await adapter.update<TestUser>("users", { where: { id: 1 } }, { age: 31 });
        const updated = (await adapter.find<TestUser>("users", { where: { id: 1 } }))[0];
        expect(updated).toEqual({ ...testUser, age: 31 });
      });

      it("should safe when updating entity with unexpected property", async () => {
        expect(
          adapter.update<TestUser>("users", { where: { id: 1 } }, { name: "test", unknownProperty: "unknown" } as any)
        ).resolves.not.toThrow();
      });
    });

    describe("delete", () => {
      beforeEach(async () => {
        await adapter.create("users", testUser);
        await adapter.create("users", { ...testUser, id: 2 });
      });

      it("should delete an entity", async () => {
        await adapter.delete("users", { where: { id: 1 } });
        const results = await adapter.find("users", { where: { id: 1 } });
        expect(results).toHaveLength(0);
      });

      it("should not throw when deleting non-existent entity", async () => {
        await expect(adapter.delete("users", { where: { id: 999 } })).resolves.not.toThrow();
      });

      it("should delete single entity", async () => {
        await adapter.delete("users", { where: { id: 1 } });
        const results = await adapter.find("users");
        expect(results).toHaveLength(1);
      });

      it("should safe when deleting entity with unexpected property", async () => {
        expect(adapter.delete("users", { where: { unknownProperty: "unknown" } as any })).resolves.not.toThrow();
      });
    });

    describe("clear", () => {
      beforeEach(async () => {
        await adapter.create("users", testUser);
        await adapter.create("users", { id: 2, name: "Jane Doe", age: 25 });
      });

      it("should clear all entities in a collection", async () => {
        await adapter.clear("users");
        const results = await adapter.find("users");
        expect(results).toHaveLength(0);
      });

      it("should only clear specified collection", async () => {
        await adapter.create("posts", testPost);
        await adapter.clear("users");
        const users = await adapter.find("users");
        const posts = await adapter.find("posts");
        expect(users).toHaveLength(0);
        expect(posts).toHaveLength(1);
      });
    });
  });
}
