export declare type ValueTypes = string | number | Date | boolean;
export interface QueryResult<T> {
    nextCursor?: string;
    count: number;
    items?: T[];
}
export declare type IndexType = string;
