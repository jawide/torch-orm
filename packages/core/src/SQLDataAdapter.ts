import { DataAdapter } from "./DataAdapter";
import { Query } from "./Query";

export abstract class SQLDataAdapter implements DataAdapter {
  public abstract idAttribute: string;
  public abstract typeMap: Record<string, string>;
  public abstract tables: Record<string, Record<string, string>>;

  public abstract execSQL(sql: string, params?: any[]): Promise<void>;
  public abstract querySQL<T>(sql: string, params?: any[]): Promise<T[]>;

  public async before(collection: string): Promise<void> {}
  public async after(collection: string): Promise<void> {}

  public async ensureTable(collection: string): Promise<void> {
    await this.execSQL(`
      CREATE TABLE IF NOT EXISTS ${collection} (
        ${Object.entries(this.tables[collection])
          .map(([key, type]) => `${key} ${this.typeMap[type]}`)
          .join(", ")}
      )
    `);
  }

  public async find<T>(collection: string, query?: Query<T>): Promise<T[]> {
    try {
      await this.before(collection);
      await this.ensureTable(collection);
      return this.querySQL(
        `SELECT * FROM ${collection} ${
          query?.where
            ? `WHERE ${Object.keys(query.where)
                .map((key) => `${key} = ?`)
                .join(" AND ")}`
            : ""
        } ${
          query?.sort
            ? `ORDER BY ${Object.keys(query.sort)
                .map((key) => `${key} ${query.sort![key]}`)
                .join(", ")}`
            : ""
        } ${query?.limit ? `LIMIT ${query.limit}` : ""}`,
        Object.values(query?.where ?? {})
      );
    } finally {
      this.after(collection);
    }
  }
  public async create<T>(collection: string, data: T): Promise<void> {
    try {
      await this.before(collection);
      this.ensureTable(collection);
      const id = (data as any)[this.idAttribute];
      if (!id) {
        throw new Error(`Entity must have an ${this.idAttribute}`);
      }
      await this.ensureTable(collection);
      await this.execSQL(
        `INSERT INTO ${collection} (${Object.keys(data as any).join(", ")}) VALUES (${Object.keys(data as any)
          .map(() => "?")
          .join(", ")})`,
        Object.values(data as any)
      );
    } finally {
      this.after(collection);
    }
  }
  public async update<T>(collection: string, query: Query<T>, data: Partial<T>): Promise<void> {
    try {
      await this.before(collection);
      this.ensureTable(collection);
      await this.execSQL(
        `UPDATE ${collection} ${Object.keys(data)
          .map((key) => `SET ${key} = ?`)
          .join(", ")} WHERE ${Object.keys(query.where as any)
          .map((key) => `${key} = ?`)
          .join(" AND ")}`,
        [...Object.values(data), ...Object.values(query.where as any)]
      );
    } finally {
      this.after(collection);
    }
  }
  public async delete<T>(collection: string, query: Query<T>): Promise<void> {
    try {
      await this.before(collection);
      this.ensureTable(collection);
      await this.execSQL(
        `DELETE FROM ${collection} WHERE ${Object.keys(query.where as any)
          .map((key) => `${key} = ?`)
          .join(" AND ")}`,
        Object.values(query.where as any)
      );
    } finally {
      this.after(collection);
    }
  }
  public async clear(collection: string): Promise<void> {
    try {
      await this.before(collection);
      this.ensureTable(collection);
      await this.execSQL(`DELETE FROM ${collection}`);
    } finally {
      this.after(collection);
    }
  }
}
