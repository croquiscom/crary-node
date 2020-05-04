import _ from 'lodash';

import * as Dynogels from './Dynogels';
import { Query } from './Query';
import { QueryResult } from './Types';

export class BaseModel {
  static dynogelsModel: any;
  static schema: { schema: { [field: string]: { _type: string } } };

  static setSchema(name, schema) {
    this.schema = schema;
    this.dynogelsModel = Dynogels.define(name, schema);
  }

  private static checkHasModelInstance() {
    if (!this.dynogelsModel) {
      throw new Error('setSchema should be called');
    }
  }

  static query(hashKey: any): Query {
    this.checkHasModelInstance();
    return this.dynogelsModel.query(hashKey);
  }

  static scan(indexName?: string): Query {
    this.checkHasModelInstance();
    const scan = this.dynogelsModel.scan();
    if (indexName) {
      _.assign(scan.request, { IndexName: indexName });
    }
    return scan;
  }

  static getAsync(hashKey: string | number, options?: object): Promise<any>;
  static getAsync(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
  static getAsync(hashKey: string | number, rangeKeyOrOptions?: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    if (options) {
      return this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions, options);
    } else {
      return this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions);
    }
  }

  static createAsync(data: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    return this.dynogelsModel.createAsync(data, options);
  }

  static updateAsync(data: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    return this.dynogelsModel.updateAsync(data, options);
  }

  static destroyAsync(hashKey: string | number, options?: object): Promise<any>;
  static destroyAsync(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
  static destroyAsync(hashKey: string | number, rangeKeyOrOptions?: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    if (options) {
      return this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions, options);
    } else {
      return this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions);
    }
  }

  // V2, with mapItem
  static async create<M extends BaseModel>(this: (new () => M) & typeof BaseModel, data: any, options?: object): Promise<M> {
    this.checkHasModelInstance();

    const createResult = await this.dynogelsModel.createAsync(data, options);
    return this.mapItem(createResult);
  }

  static async createBulk<M extends BaseModel>(this: (new () => M) & typeof BaseModel, data: any[], options?: object): Promise<M[]> {
    this.checkHasModelInstance();
    if (data.length === 0) {
      return [];
    }
    const results = await this.dynogelsModel.createAsync(data, options);
    return results.map((result) => this.mapItem(result));
  }

  static async get(hashKey: string | number, options?: object): Promise<any>;
  static async get(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
  static async get(hashKey: string | number, rangeKeyOrOptions?: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    let getResult;
    if (options) {
      getResult = await this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions, options);
    } else {
      getResult = await this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions);
    }
    return this.mapItem(getResult);
  }

  static async update<M extends BaseModel>(this: (new () => M) & typeof BaseModel, data: any, options?: object): Promise<M> {
    /**
     * Dynogel이 undefined 처리를 못하므로 직접 null로 변경
     */
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        data[key] = null;
      }
    });
    this.checkHasModelInstance();
    const updateResult = await this.dynogelsModel.updateAsync(data, options);
    return this.mapItem(updateResult);
  }

  static async destroy(hashKey: string | number, options?: object): Promise<any>;
  static async destroy(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
  static async destroy(hashKey: string | number, rangeKeyOrOptions?: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    let destroyResult;
    if (options) {
      destroyResult = await this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions, options);
    } else {
      destroyResult = await this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions);
    }
    return this.mapItem(destroyResult);
  }

  static updateTable(params?: any): Promise<any> {
    return this.dynogelsModel.updateTableAsync(params);
  }

  static describeTable(): Promise<any> {
    return this.dynogelsModel.describeTableAsync();
  }

  static async list(cursor?: string) {
    const scan = this.scan();
    if (cursor) {
      scan.startKey(cursor);
    }
    return this.mapQueryResult(await scan.execAsync());
  }

  static async getItems(keys: any[], options?): Promise<any[]> {
    const getResult = await this.dynogelsModel.getItemsAsync(keys, options);
    return _.map(getResult, (item) => this.mapItem(item));
  }

  static mapQueryResultItems<T>(result): T[] {
    return _.map<any, T>(result?.Items, (item) => this.mapItem(item));
  }

  static mapQueryResult<T>(result): QueryResult<T> {
    const output: QueryResult<T> = { count: 0, items: [], nextCursor: undefined };
    if (result.Items) {
      output.items = _.map<any, T>(result.Items, (item) => this.mapItem(item));
    }
    if (result.Count) {
      output.count = result.Count;
    }
    if (result.LastEvaluatedKey) {
      output.nextCursor = JSON.stringify(result.LastEvaluatedKey);
    } else {
      delete output.nextCursor;
    }

    return output;
  }

  static mapItem<T>(result): T {
    return result && this.convertDateFields(result.toJSON());
  }

  static convertDateFields(data) {
    for (const field_name of Object.keys(data)) {
      if (this.schema.schema[field_name]?._type === 'date') {
        data[field_name] = new Date(data[field_name]);
      } else if (typeof data[field_name] === 'object') {
        //  todo : implement
      }
    }
    return data;
  }
}
