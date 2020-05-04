"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const Dynogels = __importStar(require("./Dynogels"));
class BaseModel {
    static setSchema(name, schema) {
        this.schema = schema;
        this.dynogelsModel = Dynogels.define(name, schema);
    }
    static checkHasModelInstance() {
        if (!this.dynogelsModel) {
            throw new Error('setSchema should be called');
        }
    }
    static query(hashKey) {
        this.checkHasModelInstance();
        return this.dynogelsModel.query(hashKey);
    }
    static scan(indexName) {
        this.checkHasModelInstance();
        const scan = this.dynogelsModel.scan();
        if (indexName) {
            lodash_1.default.assign(scan.request, { IndexName: indexName });
        }
        return scan;
    }
    static getAsync(hashKey, rangeKeyOrOptions, options) {
        this.checkHasModelInstance();
        if (options) {
            return this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions, options);
        }
        else {
            return this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions);
        }
    }
    static createAsync(data, options) {
        this.checkHasModelInstance();
        return this.dynogelsModel.createAsync(data, options);
    }
    static updateAsync(data, options) {
        this.checkHasModelInstance();
        return this.dynogelsModel.updateAsync(data, options);
    }
    static destroyAsync(hashKey, rangeKeyOrOptions, options) {
        this.checkHasModelInstance();
        if (options) {
            return this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions, options);
        }
        else {
            return this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions);
        }
    }
    // V2, with mapItem
    static async create(data, options) {
        this.checkHasModelInstance();
        const createResult = await this.dynogelsModel.createAsync(data, options);
        return this.mapItem(createResult);
    }
    static async createBulk(data, options) {
        this.checkHasModelInstance();
        if (data.length === 0) {
            return [];
        }
        const results = await this.dynogelsModel.createAsync(data, options);
        return results.map((result) => this.mapItem(result));
    }
    static async get(hashKey, rangeKeyOrOptions, options) {
        this.checkHasModelInstance();
        let getResult;
        if (options) {
            getResult = await this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions, options);
        }
        else {
            getResult = await this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions);
        }
        return this.mapItem(getResult);
    }
    static async update(data, options) {
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
    static async destroy(hashKey, rangeKeyOrOptions, options) {
        this.checkHasModelInstance();
        let destroyResult;
        if (options) {
            destroyResult = await this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions, options);
        }
        else {
            destroyResult = await this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions);
        }
        return this.mapItem(destroyResult);
    }
    static updateTable(params) {
        return this.dynogelsModel.updateTableAsync(params);
    }
    static describeTable() {
        return this.dynogelsModel.describeTableAsync();
    }
    static async list(cursor) {
        const scan = this.scan();
        if (cursor) {
            scan.startKey(cursor);
        }
        return this.mapQueryResult(await scan.execAsync());
    }
    static async getItems(keys, options) {
        const getResult = await this.dynogelsModel.getItemsAsync(keys, options);
        return lodash_1.default.map(getResult, (item) => this.mapItem(item));
    }
    static mapQueryResultItems(result) {
        return lodash_1.default.map(result === null || result === void 0 ? void 0 : result.Items, (item) => this.mapItem(item));
    }
    static mapQueryResult(result) {
        const output = { count: 0, items: [], nextCursor: undefined };
        if (result.Items) {
            output.items = lodash_1.default.map(result.Items, (item) => this.mapItem(item));
        }
        if (result.Count) {
            output.count = result.Count;
        }
        if (result.LastEvaluatedKey) {
            output.nextCursor = JSON.stringify(result.LastEvaluatedKey);
        }
        else {
            delete output.nextCursor;
        }
        return output;
    }
    static mapItem(result) {
        return result && this.convertDateFields(result.toJSON());
    }
    static convertDateFields(data) {
        var _a;
        for (const field_name of Object.keys(data)) {
            if (((_a = this.schema.schema[field_name]) === null || _a === void 0 ? void 0 : _a._type) === 'date') {
                data[field_name] = new Date(data[field_name]);
            }
            else if (typeof data[field_name] === 'object') {
                //  todo : implement
            }
        }
        return data;
    }
}
exports.BaseModel = BaseModel;
