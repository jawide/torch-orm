import { SQLDataAdapter } from "@torch-orm/core";
import mysql, { Pool, PoolConnection, PoolOptions } from "mysql2/promise";

export interface MySQLDataAdapterOptions {
  poolOptions: PoolOptions;
  tables: Record<string, Record<string, string>>;
  typeMap?: Record<string, string>;
}

export class MySQLDataAdapter extends SQLDataAdapter {
  public pool: Pool;
  public idAttribute: string = "id";
  public tables: Record<string, Record<string, string>>;
  public typeMap: Record<string, string>;
  private connection?: PoolConnection;

  constructor(options: MySQLDataAdapterOptions) {
    super();
    this.pool = mysql.createPool(options.poolOptions);
    this.tables = options.tables;
    this.typeMap = options.typeMap || this.defaultTypeMap;
  }

  public defaultTypeMap: Record<string, string> = {
    string: "VARCHAR(255)",
    number: "INT",
    boolean: "BOOLEAN",
    object: "JSON",
    array: "JSON",
    date: "DATETIME",
    buffer: "BLOB",
    undefined: "VARCHAR(255)",
    null: "VARCHAR(255)",
  };

  async before(collection: string): Promise<void> {
    this.connection = await this.pool.getConnection();
  }
  async after(collection: string): Promise<void> {
    this.connection!.release();
  }
  async execSQL(sql: string, params?: any[]): Promise<void> {
    await this.connection!.execute(sql, params);
  }
  async querySQL<T>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await this.connection!.query(sql, params);
    return rows as T[];
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
