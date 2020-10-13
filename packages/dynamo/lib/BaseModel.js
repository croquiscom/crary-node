"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const _ = __importStar(require("lodash"));
const Dynogels = __importStar(require("./Dynogels"));
const ResultMapper_1 = require("./ResultMapper");
class BaseModel {
    static setSchema(name, schema) {
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
            _.assign(scan.request, { IndexName: indexName });
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
        return ResultMapper_1.ResultMapper.mapItem(createResult);
    }
    static async createBulk(data, options) {
        this.checkHasModelInstance();
        if (data.length === 0) {
            return [];
        }
        const results = await this.dynogelsModel.createAsync(data, options);
        return results.map((result) => ResultMapper_1.ResultMapper.mapItem(result));
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
        return ResultMapper_1.ResultMapper.mapItem(getResult);
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
        return ResultMapper_1.ResultMapper.mapItem(updateResult);
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
        return ResultMapper_1.ResultMapper.mapItem(destroyResult);
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
        return ResultMapper_1.ResultMapper.mapQueryResult(await scan.execAsync());
    }
    static async getItems(keys, options) {
        const getResult = await this.dynogelsModel.getItemsAsync(keys, options);
        return _.map(getResult, (item) => ResultMapper_1.ResultMapper.mapItem(item));
    }
}
exports.BaseModel = BaseModel;
