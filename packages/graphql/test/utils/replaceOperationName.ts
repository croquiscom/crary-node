import { expect } from 'chai';
import { parse, print } from 'graphql';
import { replaceOperationName } from '../..';

describe('replaceOperationName', () => {
  it('default', () => {
    const run = (query: string) => print(replaceOperationName(parse(query), 'NewOp'));
    expect(run('query MyOp { some_model { id } another_model { id } }')).to.eql(
      'query NewOp {\n  some_model {\n    id\n  }\n  another_model {\n    id\n  }\n}',
    );
    expect(run('{ some_model { id } another_model { id } }')).to.eql(
      'query NewOp {\n  some_model {\n    id\n  }\n  another_model {\n    id\n  }\n}',
    );
    expect(run('mutation ($id: ID) { some_model(id: $id) { id } another_model { id } }')).to.eql(
      'mutation NewOp($id: ID) {\n  some_model(id: $id) {\n    id\n  }\n  another_model {\n    id\n  }\n}',
    );
  });
});
