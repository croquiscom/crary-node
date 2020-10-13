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
exports.getEndPoint = exports.define = exports.types = exports.dynamodb = exports.is_real_db = void 0;
const aws_sdk_1 = require("aws-sdk");
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
let options;
if (exports.is_real_db) {
    options = { region: 'ap-northeast-2' };
}
else if (NODE_ENV === 'test') {
    options = {
        endpoint: getEndPoint(),
        accessKeyId: 'mock',
        secretAccessKey: 'mock',
        region: 'us-east-1',
    };
}
else {
    options = {
        endpoint: getEndPoint(),
        region: 'localhost',
    };
}
exports.dynamodb = new aws_sdk_1.DynamoDB(options);
dynogels.dynamoDriver(exports.dynamodb);
function define(name, schema) {
    if (process.env.NODE_ENV === 'test') {
        schema.tableName = `test-${name}`;
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
