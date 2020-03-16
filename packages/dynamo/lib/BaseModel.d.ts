import Query from './Query';
export declare class BaseModel {
    static dynogelsModel: any;
    static setSchema(name: any, schema: any): void;
    private static checkHasModelInstance;
    static query(hashKey: any): Query;
    static scan(indexName?: string): Query;
    static getAsync(hashKey: string | number, options?: object): Promise<any>;
    static getAsync(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
    static createAsync(data: any, options?: object): Promise<any>;
    static updateAsync(data: any, options?: object): Promise<any>;
    static destroyAsync(hashKey: string | number, options?: object): Promise<any>;
    static destroyAsync(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
    static create<M extends BaseModel>(this: (new () => M) & typeof BaseModel, data: any, options?: object): Promise<M>;
    static createBulk<M extends BaseModel>(this: (new () => M) & typeof BaseModel, data: any[], options?: object): Promise<M[]>;
    static get(hashKey: string | number, options?: object): Promise<any>;
    static get(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
    static update<M extends BaseModel>(this: (new () => M) & typeof BaseModel, data: any, options?: object): Promise<M>;
    static destroy(hashKey: string | number, options?: object): Promise<any>;
    static destroy(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
    static updateTable(params?: any): Promise<any>;
    static describeTable(): Promise<any>;
    static list(cursor?: string): Promise<import("./Types").QueryResult<unknown>>;
    static getItems(keys: any[], options?: any): Promise<any[]>;
}
