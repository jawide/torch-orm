export interface Query {
  where?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort?: Array<[string, 'asc' | 'desc']>;
} 