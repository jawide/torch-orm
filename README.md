# Torch ORM

一个轻量级的 ORM 库，支持浏览器和 Node.js 环境。基于适配器模式设计，可以轻松扩展支持不同的存储后端。

## 特性

- 支持浏览器和 Node.js
- 基于适配器模式，易于扩展
- 内置 Map、LocalStorage、SQLite、MySQL 适配器
- TypeScript 支持
- 简单的 API 设计

## 安装

```bash
pnpm add @torch-orm/core
```

## 使用示例

```typescript
import { DataStore, MapDataAdapter } from "@torch-orm/core";

interface User {
  id: number;
  name: string;
  age: number;
}

// 创建适配器和数据存储实例
const adapter = new MapDataAdapter();
const userStore = new DataStore<User>("users", {
  adapter,
  idAttribute: "id" // 可选，默认为 "id"
});

// 创建用户
await userStore.create({
  id: 1,
  name: "John Doe",
  age: 30
});

// 查询用户
const users = await userStore.find({
  where: { id: 1 }
});

// 更新用户
await userStore.update(1, { age: 31 });

// 删除用户
await userStore.delete(1);
```

## API

### DataStore

- `constructor(collection: string, options: DataStoreOptions)`
  - `collection`: 集合名称
  - `options.adapter`: 数据适配器实例
  - `options.idAttribute`: 自定义 ID 字段名称（可选，默认为 "id"）

- `find(query?: Query): Promise<T[]>`
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
  sort?: Array<[string, "asc" | "desc"]>;
}
```

## 适配器

### MapDataAdapter

使用 JavaScript Map 作为存储后端的内存适配器。

```typescript
interface MapDataAdapterOptions {
  initialData?: Map<string, Map<string | number, Record<string, any>>>;
}

const adapter = new MapDataAdapter({
  initialData: new Map() // 可选，初始数据
});
```

### LocalStorageDataAdapter

使用浏览器 LocalStorage 作为存储后端的适配器。

```typescript
interface LocalStorageDataAdapterOptions {
  prefix?: string;    // 可选，键前缀，默认为 "torch-orm:"
  storage?: Storage;  // 可选，存储实现，默认为 localStorage
}

const adapter = new LocalStorageDataAdapter({
  prefix: "app:",
  storage: sessionStorage // 可选，使用其他存储实现
});
```

### SQLiteDataAdapter

使用 SQL.js 作为存储后端的 SQLite 适配器。

```typescript
interface SQLiteDataAdapterOptions {
  filename?: string;  // 可选，数据库文件名
  memory?: boolean;   // 可选，是否使用内存数据库
}

const adapter = new SQLiteDataAdapter({
  memory: true // 使用内存数据库
});
```

### MySQLDataAdapter

使用 MySQL 作为存储后端的适配器。

```typescript
interface MySQLDataAdapterOptions {
  host: string;
  user: string;
  password: string;
  database: string;
  // 其他 mysql2 连接池选项
  waitForConnections?: boolean;
  connectionLimit?: number;
  maxIdle?: number;
  idleTimeout?: number;
  queueLimit?: number;
  enableKeepAlive?: boolean;
  keepAliveInitialDelay?: number;
}

const adapter = new MySQLDataAdapter({
  host: "localhost",
  user: "root",
  password: "password",
  database: "myapp",
  connectionLimit: 10
});

// 使用完毕后关闭连接池
await adapter.close();
```

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