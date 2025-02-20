import { SQLiteDataAdapter } from "@torch-orm/sqlite";
import { runAdapterTests } from "@torch-orm/test";

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
    })
);
