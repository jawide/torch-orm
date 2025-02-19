import { DataAdapter, Query } from "@torch-orm/core";
import mysql, { Pool, PoolConnection, PoolOptions } from "mysql2/promise";

export interface MySQLDataAdapterOptions extends PoolOptions {
  database: string;
}

export class MySQLDataAdapter implements DataAdapter {
  public idAttribute: string = "id";
  public pool: Pool;

  constructor(options: MySQLDataAdapterOptions) {
    this.pool = mysql.createPool(options);
  }

  private async ensureTable(connection: PoolConnection, collection: string): Promise<void> {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ${collection} (
        ${this.idAttribute} VARCHAR(255) PRIMARY KEY,
        data JSON NOT NULL
      )
    `);
  }

  async find<T extends Record<string, any>>(collection: string, query: Query): Promise<T[]> {
    const connection = await this.pool.getConnection();
    try {
      await this.ensureTable(connection, collection);

      const conditions: string[] = [];
      const params: any[] = [];

      if (query.where) {
        Object.entries(query.where).forEach(([key, value]) => {
          conditions.push(`JSON_EXTRACT(data, '$.${key}') = ?`);
          params.push(value);
        });
      }

      let sql = `SELECT JSON_UNQUOTE(data) as data FROM ${collection}`;
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
      }

      if (query.sort) {
        const orderBy = query.sort.map(
          ([field, order]) => `JSON_EXTRACT(data, '$.${field}') ${order === "asc" ? "ASC" : "DESC"}`
        );
        sql += ` ORDER BY ${orderBy.join(", ")}`;
      }

      if (query.limit !== undefined) {
        sql += ` LIMIT ?`;
        params.push(query.limit);
        if (query.offset !== undefined) {
          sql += ` OFFSET ?`;
          params.push(query.offset);
        }
      } else if (query.offset !== undefined) {
        sql += ` LIMIT 18446744073709551615 OFFSET ?`;
        params.push(query.offset);
      }

      const [rows] = await connection.query(sql, params);
      return (rows as any[]).map((row) => JSON.parse(row.data));
    } finally {
      connection.release();
    }
  }

  async create<T extends Record<string, any>>(collection: string, data: T): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await this.ensureTable(connection, collection);

      const id = data[this.idAttribute];
      if (!id) {
        throw new Error(`Entity must have an ${this.idAttribute}`);
      }

      const jsonData = JSON.stringify(data);
      await connection.query(`INSERT INTO ${collection} (${this.idAttribute}, data) VALUES (?, ?)`, [
        String(id),
        jsonData,
      ]);

      return data;
    } finally {
      connection.release();
    }
  }

  async update<T extends Record<string, any>>(collection: string, id: string | number, data: Partial<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await this.ensureTable(connection, collection);

      const [rows] = await connection.query(
        `SELECT JSON_UNQUOTE(data) as data FROM ${collection} WHERE ${this.idAttribute} = ?`,
        [String(id)]
      );

      if (!(rows as any[]).length) {
        throw new Error("Entity not found");
      }

      const existing = JSON.parse((rows as any[])[0].data);
      const updated = { ...existing, ...data };
      const jsonData = JSON.stringify(updated);

      await connection.query(`UPDATE ${collection} SET data = ? WHERE ${this.idAttribute} = ?`, [jsonData, String(id)]);

      return updated;
    } finally {
      connection.release();
    }
  }

  async delete(collection: string, id: string | number): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await this.ensureTable(connection, collection);

      await connection.query(`DELETE FROM ${collection} WHERE ${this.idAttribute} = ?`, [String(id)]);
    } finally {
      connection.release();
    }
  }

  async clear(collection: string): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await this.ensureTable(connection, collection);
      await connection.query(`DELETE FROM ${collection}`);
    } finally {
      connection.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
