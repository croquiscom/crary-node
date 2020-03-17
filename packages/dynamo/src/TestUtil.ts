import * as dynogels from 'dynogels-promisified';
import _ from 'lodash';

import { is_real_db } from './Dynogels';

export class TestUtil {
  static async createTables() {
    if (is_real_db) {
      throw new Error('createTables is forbidden in real environment');
    }
    try {
      const dynamodb = dynogels.dynamoDriver();
      const listTableResult = await dynamodb.listTables().promise();
      const modelTableNames = _.map(_.keys(dynogels.models), (key) => dynogels.models[key].tableName());
      const notExistTables = _.differenceWith(modelTableNames, listTableResult.TableNames);
      if (notExistTables.length > 0) {
        const r = await dynogels.createTablesAsync({ $dynogels: { pollingInterval: 50 } });
        return r;
      }
    } catch (e) {
      console.log('createTables error', e);
    }
  }

  static async truncateTables() {
    if (is_real_db) {
      throw new Error('truncateTables is forbidden in real environment');
    }
    const dynamodb = dynogels.dynamoDriver();
    const listTableResult = await dynamodb.listTables().promise();
    if (listTableResult.TableNames.length > 0) {
      await Promise.all(_.keys(dynogels.models).map(async (modelName) => {
        const m = dynogels.models[modelName];
        const describeTable = await m.describeTableAsync();
        const hashKeyAttr = _.find<any>(describeTable.Table.KeySchema, (key) => key.KeyType === 'HASH');

        const rangeKeyAttr = _.find<any>(describeTable.Table.KeySchema, (key) => key.KeyType === 'RANGE');
        const hashKeyName = hashKeyAttr.AttributeName;
        const rangeKeyName = (rangeKeyAttr) ? rangeKeyAttr.AttributeName : null;

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
      return Promise.all(_.keys(dynogels.models).map(async (modelName) => {
        const m = dynogels.models[modelName];
        const describeTable = await m.describeTableAsync();
        return describeTable;
      }));
    }
  }
}
