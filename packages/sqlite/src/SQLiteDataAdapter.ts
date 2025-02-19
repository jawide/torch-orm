import { DataAdapter, Query } from "@torch-orm/core";
import initSqlJs, { Database } from "sql.js";

export interface SQLiteDataAdapterOptions {
  filename?: string;
  memory?: boolean;
}

export class SQLiteDataAdapter implements DataAdapter {
  public idAttribute: string = "id";
  public db: Database | null = null;
  public initPromise: Promise<void>;

  constructor(options: SQLiteDataAdapterOptions = {}) {
    this.initPromise = this.init();
  }

  private async init(): Promise<void> {
    const SQL = await initSqlJs();
    this.db = new SQL.Database();
  }

  private async ensureTable(collection: string): Promise<void> {
    await this.initPromise;
    if (!this.db) throw new Error("Database not initialized");

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${collection} (
        ${this.idAttribute} TEXT PRIMARY KEY,
        data TEXT NOT NULL
      )
    `);
  }

  async find<T extends Record<string, any>>(collection: string, query: Query): Promise<T[]> {
    await this.ensureTable(collection);
    if (!this.db) throw new Error("Database not initialized");

    const conditions: string[] = [];
    const params: any[] = [];

    if (query.where) {
      Object.entries(query.where).forEach(([key, value]) => {
        conditions.push(`json_extract(data, '$.${key}') = ?`);
        params.push(value);
      });
    }

    let sql = `SELECT data FROM ${collection}`;
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (query.sort) {
      const orderBy = query.sort.map(
        ([field, order]) => `json_extract(data, '$.${field}') ${order === "asc" ? "ASC" : "DESC"}`
      );
      sql += ` ORDER BY ${orderBy.join(", ")}`;
    }

    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
      if (query.offset) {
        sql += ` OFFSET ${query.offset}`;
      }
    } else if (query.offset) {
      sql += ` LIMIT -1 OFFSET ${query.offset}`;
    }

    const results = this.db.exec(sql, params);
    return results[0]?.values?.map((row: any[]) => JSON.parse(row[0] as string)) || [];
  }

  async create<T extends Record<string, any>>(collection: string, data: T): Promise<T> {
    await this.ensureTable(collection);
    if (!this.db) throw new Error("Database not initialized");

    const id = data[this.idAttribute];
    if (!id) {
      throw new Error(`Entity must have an ${this.idAttribute}`);
    }

    this.db.run(`INSERT INTO ${collection} (${this.idAttribute}, data) VALUES (?, ?)`, [
      String(id),
      JSON.stringify(data),
    ]);

    return data;
  }

  async update<T extends Record<string, any>>(collection: string, id: string | number, data: Partial<T>): Promise<T> {
    await this.ensureTable(collection);
    if (!this.db) throw new Error("Database not initialized");

    const result = this.db.exec(`SELECT data FROM ${collection} WHERE ${this.idAttribute} = ?`, [String(id)]);

    if (!result[0]?.values?.length) {
      throw new Error("Entity not found");
    }

    const existing = JSON.parse(result[0].values[0][0] as string);
    const updated = { ...existing, ...data };

    this.db.run(`UPDATE ${collection} SET data = ? WHERE ${this.idAttribute} = ?`, [
      JSON.stringify(updated),
      String(id),
    ]);

    return updated;
  }

  async delete(collection: string, id: string | number): Promise<void> {
    await this.ensureTable(collection);
    if (!this.db) throw new Error("Database not initialized");

    this.db.run(`DELETE FROM ${collection} WHERE ${this.idAttribute} = ?`, [String(id)]);
  }

  async clear(collection: string): Promise<void> {
    await this.ensureTable(collection);
    if (!this.db) throw new Error("Database not initialized");

    this.db.run(`DELETE FROM ${collection}`);
  }
}
