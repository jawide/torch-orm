import { MySQLDataAdapter, MySQLDataAdapterOptions } from "@torch-orm/mysql";
import { runAdapterTests } from "@torch-orm/test";
import { config } from "dotenv";

// 加载环境变量
config();

interface MySQLDataAdapterEnv {
  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  MYSQL_TEST_DATABASE: string;
  MYSQL_CONNECTION_LIMIT: string;
  MYSQL_MAX_IDLE: string;
  MYSQL_IDLE_TIMEOUT: string;
}

const env = process.env as unknown as MySQLDataAdapterEnv;

const options = {
  poolOptions: {
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_TEST_DATABASE,
    waitForConnections: true,
    connectionLimit: parseInt(env.MYSQL_CONNECTION_LIMIT),
    maxIdle: parseInt(env.MYSQL_MAX_IDLE),
    idleTimeout: parseInt(env.MYSQL_IDLE_TIMEOUT),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  },

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
} as MySQLDataAdapterOptions;
const adapter = new MySQLDataAdapter(options);

beforeAll(async () => {
  // 创建测试数据库
  const tempAdapter = new MySQLDataAdapter({
    ...options,
    poolOptions: {
      ...options.poolOptions,
      database: "mysql", // 使用系统数据库
      connectionLimit: 1,
    },
  });

  try {
    await tempAdapter.pool.execute(`DROP DATABASE IF EXISTS ${options.poolOptions.database}`);
    await tempAdapter.pool.execute(`CREATE DATABASE ${options.poolOptions.database}`);
  } finally {
    await tempAdapter.close();
  }
});

afterAll(async () => {
  // 清理测试数据库
  const tempAdapter = new MySQLDataAdapter({
    ...options,
    poolOptions: {
      ...options.poolOptions,
      database: "mysql", // 使用系统数据库
      connectionLimit: 1,
    },
  });

  try {
    await tempAdapter.pool.execute(`DROP DATABASE IF EXISTS ${options.poolOptions.database}`);
  } finally {
    await tempAdapter.close();
    await adapter.close();
  }
});

runAdapterTests(
  "MySQLDataAdapter",
  () => adapter,
  async () => {
    // 清理所有表
    const connection = await adapter.pool.getConnection();
    try {
      const [tables] = await connection.query("SHOW TABLES");
      for (const table of tables as any[]) {
        const tableName = table[Object.keys(table)[0]];
        await connection.execute(`DROP TABLE IF EXISTS ${tableName}`);
      }
    } finally {
      connection.release();
    }
  }
);
