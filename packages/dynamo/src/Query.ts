import { IndexType, QueryResult, ValueTypes } from './Types';

interface RawQueryResult {
  LastEvaluatedKey?: ValueTypes;
  Count: number;
  Items?: any[];
}

interface Query {
  usingIndex(index: IndexType): Query;
  descending(): Query;
  ascending(): Query;
  limit(count: number): Query;

  where(field: string): Query;
  equals(value: ValueTypes): Query;
  eq(value: ValueTypes): Query;
  filter(field: string): Query;
  gt(value: ValueTypes): Query;
  gte(value: ValueTypes): Query;

  lt(value: ValueTypes): Query;
  lte(value: ValueTypes): Query;
  beginsWith(value: ValueTypes): Query;
  between(fromValue: ValueTypes, toValue: ValueTypes): Query;

  // Filter expressions
  ne(value: ValueTypes): Query;
  null(): Query;
  notNull(): Query;
  exists(): Query;
  contains(value: ValueTypes): Query;
  notContains(value: ValueTypes): Query;
  in(values: ValueTypes[]): Query;

  select(field: string): Query;
  attributes(fields: string[]): Query;
  startKey(key: string): Query;
  loadAll(): Query;
  consistentRead(): Query;

  returnConsumedCapacity(): Query;
  filterExpression(expr: string): Query;
  expressionAttributeValues(params: any): Query;
  expressionAttributeNames(params: any): Query;
  execAsync(): Promise<RawQueryResult>;
}

export default Query;
