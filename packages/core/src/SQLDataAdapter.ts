import { DataAdapter } from "./DataAdapter";
import { Query } from "./Query";

export abstract class SQLDataAdapter implements DataAdapter {
  public abstract idAttribute: string;
  public abstract typeMap: Record<string, string>;
  public abstract tables: Record<string, Record<string, string>>;

  public abstract execSQL(sql: string, params?: any[]): Promise<void>;
  public abstract querySQL<T>(sql: string, params?: any[]): Promise<T[]>;

  private ensured = new Set<string>();

  public async before(collection: string): Promise<void> {}
  public async after(collection: string): Promise<void> {}

  private buildWhere<T>(collection: string, where?: Partial<T>) {
    const keys = Object.keys(where ?? {}).filter(
      (key) => this.tables[collection][key] && (where as any)[key] !== undefined
    );
    return {
      clause: keys.length > 0 ? `WHERE ${keys.map((key) => `${key} = ?`).join(" AND ")}` : "",
      params: keys.map((key) => (where as any)[key]),
    };
  }

  private buildPaging(query?: Query<any>) {
    if (query?.limit === undefined && query?.offset === undefined) {
      return { clause: "", params: [] as unknown[] };
    }
    if (query?.limit === undefined) {
      return { clause: "LIMIT 9223372036854775807 OFFSET ?", params: [query?.offset] };
    }
    return { clause: "LIMIT ? OFFSET ?", params: [query.limit, query?.offset ?? 0] };
  }

  public async ensureTable(collection: string): Promise<void> {
    if (this.ensured.has(collection)) {
      return;
    }
    await this.execSQL(`
      CREATE TABLE IF NOT EXISTS ${collection} (
        ${Object.entries(this.tables[collection])
          .map(([key, type]) => `${key} ${this.typeMap[type]} ${this.idAttribute === key ? "PRIMARY KEY" : ""}`)
          .join(", ")}
      )
    `);
    this.ensured.add(collection);
  }

  public async find<T>(collection: string, query?: Query<T>): Promise<T[]> {
    const where = this.buildWhere(collection, query?.where);
    const paging = this.buildPaging(query);
    const validSort = Object.keys(query?.sort ?? {}).filter((key) => this.tables[collection][key]);

    try {
      await this.before(collection);
      await this.ensureTable(collection);
      return this.querySQL(
        `SELECT * FROM ${collection} ${where.clause} ${
          validSort.length > 0 ? `ORDER BY ${validSort.map((key) => `${key} ${query?.sort![key]}`).join(", ")}` : ""
        } ${paging.clause}`,
        [...where.params, ...paging.params]
      );
    } finally {
      await this.after(collection);
    }
  }

  public async count<T>(collection: string, query?: Query<T>): Promise<number> {
    const where = this.buildWhere(collection, query?.where);

    try {
      await this.before(collection);
      await this.ensureTable(collection);
      const rows = await this.querySQL<{ total: number }>(
        `SELECT COUNT(*) AS total FROM ${collection} ${where.clause}`,
        where.params
      );
      return Number(rows[0]?.total ?? 0);
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
    const where = this.buildWhere(collection, query?.where);
    if (!where.clause) {
      throw new Error(`Entity update requires a where clause, use clear() to remove all`);
    }

    try {
      await this.before(collection);
      await this.ensureTable(collection);

      await this.execSQL(
        `UPDATE ${collection} SET ${validData.map((key) => `${key} = ?`).join(", ")} ${where.clause}`,
        [...validData.map((key) => (data as any)[key]), ...where.params]
      );
    } finally {
      await this.after(collection);
    }
  }

  public async delete<T>(collection: string, query: Query<T>): Promise<void> {
    const where = this.buildWhere(collection, query?.where);
    if (!where.clause) {
      throw new Error(`Entity delete requires a where clause, use clear() to remove all`);
    }

    try {
      await this.before(collection);
      await this.ensureTable(collection);
      await this.execSQL(`DELETE FROM ${collection} ${where.clause}`, where.params);
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
