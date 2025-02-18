import { LocalStorageDataAdapter } from '../adapters/LocalStorageDataAdapter';
import { LocalStorage } from 'node-localstorage';
import * as path from 'path';
import * as fs from 'fs';
import { runAdapterTests, TestUser } from './utils/adapter-test-utils';

// 设置测试用的 localStorage 目录
const TEST_STORAGE_PATH = path.join(process.cwd(), '.test-storage');

// 确保测试存储目录存在
if (!fs.existsSync(TEST_STORAGE_PATH)) {
  fs.mkdirSync(TEST_STORAGE_PATH, { recursive: true });
}

// 在全局作用域中模拟 localStorage
global.localStorage = new LocalStorage(TEST_STORAGE_PATH);

// 运行通用测试
runAdapterTests(
  'LocalStorageDataAdapter',
  () => new LocalStorageDataAdapter('test:'),
  () => {
    // 确保测试存储目录存在
    if (!fs.existsSync(TEST_STORAGE_PATH)) {
      fs.mkdirSync(TEST_STORAGE_PATH, { recursive: true });
    }
    localStorage.clear();
  },
  () => {
    // 清理测试存储目录
    if (fs.existsSync(TEST_STORAGE_PATH)) {
      fs.rmSync(TEST_STORAGE_PATH, { recursive: true, force: true });
    }
  }
);