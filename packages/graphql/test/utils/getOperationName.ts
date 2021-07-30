import { expect } from 'chai';
import { parse } from 'graphql';
import { getOperationName } from '../..';

describe('getOperationName', () => {
  it('string', () => {
    expect(getOperationName('query MyOp { some_model { id } another_model { id } }')).to.eql('MyOp');
    expect(getOperationName('{ some_model { id } another_model { id } }')).to.eql(null);
  });

  it('DocumentNode', () => {
    expect(getOperationName(parse('query MyOp { some_model { id } another_model { id } }'))).to.eql('MyOp');
    expect(getOperationName(parse('{ some_model { id } another_model { id } }'))).to.eql(null);
  });
});
