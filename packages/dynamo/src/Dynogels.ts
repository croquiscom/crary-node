import { DynamoDB } from 'aws-sdk';

import * as dynogels from 'dynogels-promisified';
import * as Joi from 'joi';
import * as _ from 'lodash';

function define(name, schema) {
  if (process.env.NODE_ENV === 'test') {
    schema.tableName = `test-${name}`;
  } else {
    schema.tableName = name;
  }
  const output = dynogels.define(name, schema);
  return output;
}

export function setDynamoDriver(driver: DynamoDB) {
  dynogels.dynamoDriver(driver);
}

const types = _.assign({}, dynogels.types, Joi);
export { types, define };
