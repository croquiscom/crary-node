import * as AWS from 'aws-sdk';

import * as dynogels from 'dynogels-promisified';
import * as Joi from 'joi';
import * as _ from 'lodash';

/**
 *  enabled WARN log level on all tables
 */
// import * as logger from 'winston';
// dynogels.log = logger;

const { NODE_ENV } = process.env;

export const is_real_db: boolean = Boolean(NODE_ENV && ['real-prod', 'production', 'real-alpha', 'alpha'].indexOf(NODE_ENV) > -1);

function getEndPoint() {
  return 'http://localhost:11505';
}

if (!is_real_db) {
  if (NODE_ENV === 'test') {
    const dynamodb = new AWS.DynamoDB({
      endpoint: getEndPoint(),
      accessKeyId: 'mock',
      secretAccessKey: 'mock',
      region: 'us-east-1',
    });
    dynogels.dynamoDriver(dynamodb);
  } else {
    const dynamodb = new AWS.DynamoDB({
      endpoint: getEndPoint(),
      region: 'localhost',
    });
    dynogels.dynamoDriver(dynamodb);
  }
} else {
  const dynamodb = new AWS.DynamoDB({
    region: 'ap-northeast-2',
  });
  dynogels.dynamoDriver(dynamodb);
}

function define(name, schema) {
  if (process.env.NODE_ENV === 'test') {
    schema.tableName = 'test-' + name;
  } else {
    schema.tableName = name;
  }
  const output = dynogels.define(name, schema);
  return output;
}

const types = _.assign({}, dynogels.types, Joi);
export { types, define, getEndPoint };
