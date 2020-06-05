"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = __importStar(require("aws-sdk"));
const dynogels = __importStar(require("dynogels-promisified"));
const Joi = __importStar(require("joi"));
const _ = __importStar(require("lodash"));
/**
 *  enabled WARN log level on all tables
 */
// import * as logger from 'winston';
// dynogels.log = logger;
const { NODE_ENV } = process.env;
exports.is_real_db = Boolean(NODE_ENV && ['real-prod', 'production', 'real-alpha', 'alpha'].indexOf(NODE_ENV) > -1);
function getEndPoint() {
    return 'http://localhost:11505';
}
exports.getEndPoint = getEndPoint;
if (!exports.is_real_db) {
    if (NODE_ENV === 'test') {
        const dynamodb = new AWS.DynamoDB({
            endpoint: getEndPoint(),
            accessKeyId: 'mock',
            secretAccessKey: 'mock',
            region: 'us-east-1',
        });
        dynogels.dynamoDriver(dynamodb);
    }
    else {
        const dynamodb = new AWS.DynamoDB({
            endpoint: getEndPoint(),
            region: 'localhost',
        });
        dynogels.dynamoDriver(dynamodb);
    }
}
else {
    const dynamodb = new AWS.DynamoDB({
        region: 'ap-northeast-2',
    });
    dynogels.dynamoDriver(dynamodb);
}
function define(name, schema) {
    if (process.env.NODE_ENV === 'test') {
        schema.tableName = 'test-' + name;
    }
    else {
        schema.tableName = name;
    }
    const output = dynogels.define(name, schema);
    return output;
}
exports.define = define;
const types = _.assign({}, dynogels.types, Joi);
exports.types = types;
