export interface Query<T> {
  where?: Partial<T>;
  limit?: number;
  offset?: number;
  sort?: Record<string, "asc" | "desc">;
}
