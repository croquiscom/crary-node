export type ValueTypes = string | number | Date | boolean;

export interface QueryResult<T> {
  nextCursor?: string;
  count: number;
  items?: T[];
}

export type IndexType = string;
