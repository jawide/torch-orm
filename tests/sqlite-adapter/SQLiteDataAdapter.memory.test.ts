import { SQLiteDataAdapter } from "@torch-orm/sqlite";
import { runAdapterTests } from "@torch-orm/test";

runAdapterTests("SQLiteDataAdapter", () => new SQLiteDataAdapter({ memory: true }));
