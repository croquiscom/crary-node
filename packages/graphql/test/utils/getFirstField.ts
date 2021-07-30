import { expect } from 'chai';
import { parse } from 'graphql';
import { getFirstField } from '../..';

describe('getFirstField', () => {
  it('string', () => {
    expect(getFirstField('query MyOp { some_model { id } another_model { id } }')).to.eql('some_model');
    expect(getFirstField('{ some_model { id } another_model { id } }')).to.eql('some_model');
  });

  it('DocumentNode', () => {
    expect(getFirstField(parse('query MyOp { some_model { id } another_model { id } }'))).to.eql('some_model');
    expect(getFirstField(parse('{ some_model { id } another_model { id } }'))).to.eql('some_model');
  });
});
