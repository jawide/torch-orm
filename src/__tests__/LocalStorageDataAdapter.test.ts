import { LocalStorageDataAdapter } from "../adapters/LocalStorageDataAdapter";
import { LocalStorage } from "node-localstorage";
import * as path from "path";
import * as fs from "fs";
import { runAdapterTests } from "./utils/adapter-test-utils";

const TEST_STORAGE_PATH = path.join(process.cwd(), ".test-storage");

if (!fs.existsSync(TEST_STORAGE_PATH)) {
  fs.mkdirSync(TEST_STORAGE_PATH, { recursive: true });
}

global.localStorage = new LocalStorage(TEST_STORAGE_PATH);

runAdapterTests(
  "LocalStorageDataAdapter",
  () => new LocalStorageDataAdapter({ prefix: "test:" }),
  () => {
    if (!fs.existsSync(TEST_STORAGE_PATH)) {
      fs.mkdirSync(TEST_STORAGE_PATH, { recursive: true });
    }
    localStorage.clear();
  },
  () => {
    if (fs.existsSync(TEST_STORAGE_PATH)) {
      fs.rmSync(TEST_STORAGE_PATH, { recursive: true, force: true });
    }
  }
);