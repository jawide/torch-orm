import { SQLiteDataAdapter } from "@torch-orm/sqlite";
import { runAdapterTests } from "@torch-orm/test";
import { describe, it, beforeEach, afterAll, expect } from "@jest/globals";

runAdapterTests(
  "SQLiteDataAdapter",
  () =>
    new SQLiteDataAdapter({
      memory: true,
      tables: {
        users: {
          id: "number",
          name: "string",
          age: "number",
        },
        posts: {
          id: "number",
          title: "string",
        },
      },
    }),
  { describe, it, beforeEach, afterAll, expect: expect as any }
);
