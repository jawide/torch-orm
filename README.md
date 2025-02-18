# Torch ORM

一个轻量级的 ORM 库，支持浏览器和 Node.js 环境。基于适配器模式设计，可以轻松扩展支持不同的存储后端。

## 特性

- 支持浏览器和 Node.js
- 基于适配器模式，易于扩展
- 内置 Map、LocalStorage 适配器
- TypeScript 支持
- 简单的 API 设计

## 安装

```bash
pnpm add torch-orm
```

## 使用示例

```typescript
import { DataStore, MapAdapter } from 'torch-orm';

interface User {
  id: number;
  name: string;
  age: number;
}

const adapter = new MapAdapter();
const userStore = new DataStore<User>(adapter, 'users');

// 创建用户
await userStore.create({
  id: 1,
  name: 'John Doe',
  age: 30
});

// 查询用户
const users = await userStore.find({
  where: { age: 30 },
  sort: [['name', 'asc']],
  limit: 10
});

// 更新用户
await userStore.update(1, { age: 31 });

// 删除用户
await userStore.delete(1);
```

## API

### DataStore

- `constructor(adapter: DataAdapter, collection: string)`
- `find(query?: Query): Promise<T[]>`
- `findOne(id: string | number): Promise<T | null>`
- `create(data: T): Promise<T>`
- `update(id: string | number, data: Partial<T>): Promise<T>`
- `delete(id: string | number): Promise<void>`
- `clear(): Promise<void>`

### Query 接口

```typescript
interface Query {
  where?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort?: Array<[string, 'asc' | 'desc']>;
}
```

## 适配器

### MapAdapter

使用 JavaScript Map 作为存储后端的内存适配器。

### LocalStorageAdapter

使用浏览器 LocalStorage 作为存储后端的适配器。

## 开发

```bash
# 安装依赖
pnpm install

# 运行测试
pnpm test

# 构建
pnpm build
```

## 许可证

MIT 