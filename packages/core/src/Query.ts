export interface Query<T> {
  where?: Partial<T>;
  limit?: number;
  sort?: Record<string, "asc" | "desc">;
}
