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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestUtil = void 0;
const dynogels = __importStar(require("dynogels-promisified"));
const lodash_1 = __importDefault(require("lodash"));
const Dynogels_1 = require("./Dynogels");
class TestUtil {
    static async createTables() {
        if (Dynogels_1.is_real_db) {
            throw new Error('createTables is forbidden in real environment');
        }
        try {
            const dynamodb = dynogels.dynamoDriver();
            const listTableResult = await dynamodb.listTables().promise();
            const modelTableNames = lodash_1.default.map(lodash_1.default.keys(dynogels.models), (key) => dynogels.models[key].tableName());
            const notExistTables = lodash_1.default.differenceWith(modelTableNames, listTableResult.TableNames);
            if (notExistTables.length > 0) {
                const r = await dynogels.createTablesAsync({ $dynogels: { pollingInterval: 50 } });
                return r;
            }
        }
        catch (e) {
            console.log('createTables error', e);
        }
    }
    static async truncateTables() {
        if (Dynogels_1.is_real_db) {
            throw new Error('truncateTables is forbidden in real environment');
        }
        const dynamodb = dynogels.dynamoDriver();
        const listTableResult = await dynamodb.listTables().promise();
        if (listTableResult.TableNames.length > 0) {
            await Promise.all(lodash_1.default.keys(dynogels.models).map(async (modelName) => {
                const m = dynogels.models[modelName];
                const describeTable = await m.describeTableAsync();
                const hashKeyAttr = lodash_1.default.find(describeTable.Table.KeySchema, (key) => key.KeyType === 'HASH');
                const rangeKeyAttr = lodash_1.default.find(describeTable.Table.KeySchema, (key) => key.KeyType === 'RANGE');
                const hashKeyName = hashKeyAttr.AttributeName;
                const rangeKeyName = rangeKeyAttr ? rangeKeyAttr.AttributeName : null;
                const scanResult = await m.scan().loadAll().execAsync();
                await Promise.all(scanResult.Items.map((item) => {
                    item = item.toJSON();
                    const hashKey = item[hashKeyName];
                    const rangeKey = rangeKeyName ? item[rangeKeyName] : null;
                    return m.destroyAsync(hashKey, rangeKey);
                }));
            }));
        }
    }
    static async describeTables() {
        const dynamodb = dynogels.dynamoDriver();
        const listTableResult = await dynamodb.listTables().promise();
        if (listTableResult.TableNames.length > 0) {
            return Promise.all(lodash_1.default.keys(dynogels.models).map(async (modelName) => {
                const m = dynogels.models[modelName];
                const describeTable = await m.describeTableAsync();
                return describeTable;
            }));
        }
    }
}
exports.TestUtil = TestUtil;
