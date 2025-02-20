import { DataAdapter, Query, SQLDataAdapter } from "@torch-orm/core";
import initSqlJs, { Database } from "sql.js";

export interface SQLiteDataAdapterOptions {
  filename?: string;
  memory?: boolean;
  tables: Record<string, Record<string, string>>;
}

export class SQLiteDataAdapter extends SQLDataAdapter {
  public typeMap: Record<string, string> = {
    string: "TEXT",
    number: "INTEGER",
    boolean: "INTEGER",
    object: "TEXT",
    array: "TEXT",
  };
  public tables: Record<string, Record<string, string>>;
  public idAttribute: string = "id";
  public db: Database | null = null;
  public initPromise: Promise<void>;

  constructor(options: SQLiteDataAdapterOptions) {
    super();
    this.tables = options.tables;
    this.initPromise = this.init();
  }

  public async init(): Promise<void> {
    const SQL = await initSqlJs();
    this.db = new SQL.Database();
  }

  async before(collection: string): Promise<void> {
    await this.initPromise;
  }

  async execSQL(sql: string, params?: any[]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    this.db.run(sql, params);
  }
  async querySQL<T>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.db) throw new Error("Database not initialized");
    const result = this.db.exec(sql, params);
    if (!result.length) return [];

    const columns = result[0].columns;
    return result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => (obj[col] = row[i]));
      return obj as T;
    });
  }
}
