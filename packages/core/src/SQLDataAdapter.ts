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
          .map(([key, type]) => `${key} ${this.typeMap[type]} ${this.idAttribute === key ? "PRIMARY KEY" : ""}`)
          .join(", ")}
      )
    `);
  }

  public async find<T>(collection: string, query?: Query<T>): Promise<T[]> {
    const validWhere = Object.keys(query?.where ?? {}).filter(
      (key) => this.tables[collection][key] && ((query?.where as any) ?? [])![key] !== undefined
    );
    const validSort = Object.keys(query?.sort ?? {}).filter((key) => this.tables[collection][key]);

    try {
      await this.before(collection);
      await this.ensureTable(collection);
      return this.querySQL(
        `SELECT * FROM ${collection} ${
          validWhere.length > 0 ? `WHERE ${validWhere.map((key) => `${key} = ?`).join(" AND ")}` : ""
        } ${
          validSort.length > 0 ? `ORDER BY ${validSort.map((key) => `${key} ${query?.sort![key]}`).join(", ")}` : ""
        } ${query?.limit ? `LIMIT ${query.limit}` : ""}`,
        validWhere.map((key) => (query?.where as any)[key])
      );
    } finally {
      await this.after(collection);
    }
  }
  public async create<T>(collection: string, data: T): Promise<void> {
    const validData = Object.keys(data as any).filter(
      (key) => this.tables[collection][key] && (data as any)[key] !== undefined
    );

    try {
      await this.before(collection);
      await this.ensureTable(collection);
      const id = (data as any)[this.idAttribute];
      if (!id) {
        throw new Error(`Entity must have an ${this.idAttribute}`);
      }
      await this.ensureTable(collection);
      try {
        await this.execSQL(
          `INSERT INTO ${collection} (${validData.join(", ")}) VALUES (${validData.map(() => "?").join(", ")})`,
          validData.map((key) => (data as any)[key])
        );
      } catch (error) {
        throw new Error(`Entity create failed ${error}`);
      }
    } finally {
      await this.after(collection);
    }
  }
  public async update<T>(collection: string, query: Query<T>, data: Partial<T>): Promise<void> {
    const validData = Object.keys(data as any).filter(
      (key) => this.tables[collection][key] && (data as any)[key] !== undefined
    );
    const validWhere = Object.keys(query?.where ?? {}).filter(
      (key) => this.tables[collection][key] && ((query?.where as any) ?? [])![key] !== undefined
    );

    try {
      await this.before(collection);
      await this.ensureTable(collection);

      await this.execSQL(
        `UPDATE ${collection} SET ${validData.map((key) => `${key} = ?`).join(", ")} WHERE ${validWhere
          .map((key) => `${key} = ?`)
          .join(" AND ")}`,
        [...validData.map((key) => (data as any)[key]), ...validWhere.map((key) => (query.where as any)[key])]
      );
    } finally {
      await this.after(collection);
    }
  }
  public async delete<T>(collection: string, query: Query<T>): Promise<void> {
    const validWhere = Object.keys(query?.where ?? {}).filter(
      (key) => this.tables[collection][key] && ((query?.where as any) ?? [])![key] !== undefined
    );

    try {
      await this.before(collection);
      await this.ensureTable(collection);
      await this.execSQL(
        `DELETE FROM ${collection} ${
          validWhere.length > 0 ? `WHERE ${validWhere.map((key) => `${key} = ?`).join(" AND ")}` : ""
        }`,
        validWhere.map((key) => (query.where as any)[key])
      );
    } finally {
      await this.after(collection);
    }
  }
  public async clear(collection: string): Promise<void> {
    try {
      await this.before(collection);
      await this.ensureTable(collection);
      await this.execSQL(`DELETE FROM ${collection}`);
    } finally {
      await this.after(collection);
    }
  }
}
