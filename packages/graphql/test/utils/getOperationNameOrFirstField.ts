import { expect } from 'chai';
import { parse } from 'graphql';
import { getOperationNameOrFirstField } from '../..';

describe('getOperationNameOrFirstField', () => {
  it('string', () => {
    expect(getOperationNameOrFirstField('query MyOp { some_model { id } another_model { id } }')).to.eql('MyOp');
    expect(getOperationNameOrFirstField('{ some_model { id } another_model { id } }')).to.eql('some_model');
  });

  it('DocumentNode', () => {
    expect(getOperationNameOrFirstField(parse('query MyOp { some_model { id } another_model { id } }'))).to.eql('MyOp');
    expect(getOperationNameOrFirstField(parse('{ some_model { id } another_model { id } }'))).to.eql('some_model');
  });
});
