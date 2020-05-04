import { expect } from 'chai';
import { describe } from 'mocha';

import { TestUtil } from '../src/TestUtil';
import { TestModel } from './TestModel';

describe('ResultMapper', () => {
  beforeEach(async () => {
    await TestUtil.createTables();
  });

  afterEach(async () => {
    await TestUtil.truncateTables();
  });

  it('works', async () => {
    const before = await TestModel.query(45231)
      .where('rangef').eq('ba')
      .loadAll()
      .execAsync();
    expect(before.Count).eql(0);
    const data = {
      hashf: 45231,
      rangef: 'ba',
      datef: new Date(),
    };
    await TestModel.create(data);
    const after = await TestModel.query(45231)
      .where('rangef').eq('ba')
      .loadAll()
      .execAsync();
    expect(TestModel.mapQueryResultItems(after)).eql([data]);
  })
})
