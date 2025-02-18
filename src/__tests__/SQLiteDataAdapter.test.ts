import { SQLiteDataAdapter } from "../adapters/SQLiteDataAdapter";
import { runAdapterTests } from "./utils/adapter-test-utils";

runAdapterTests(
  "SQLiteDataAdapter",
  () => new SQLiteDataAdapter({ memory: true })
); 