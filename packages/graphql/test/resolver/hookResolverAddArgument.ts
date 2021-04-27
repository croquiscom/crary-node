import { expect } from 'chai';
import { buildSchema, DocumentNode, graphql, GraphQLInt, GraphQLResolveInfo, Kind, print } from 'graphql';
import { hookResolverAddArgument } from '../..';

const schema = buildSchema(`
type Product {
  id: Int
  name: String
}

type Query {
  getProducts(text: String): [Product!]!
}
`);

describe('hookResolverAddArgument', () => {
  it('hook', async () => {
    let called = false;
    const originalResolve = (source: any, args: any, context: any, info: GraphQLResolveInfo) => {
      expect(called).to.eql(false);
      expect(args).to.eql({ text: 'my' });
      const document: DocumentNode = {
        definitions: [info.operation],
        kind: Kind.DOCUMENT,
      };
      const expected =
        'query ($text: String, $_c_limit: Int) { getProducts(text: $text, limit: $_c_limit) { id name } }';
      expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
      called = true;
      return [];
    };
    schema.getQueryType()!.getFields().getProducts.resolve = originalResolve;
    hookResolverAddArgument(schema.getQueryType()!.getFields().getProducts, 'limit', 5, GraphQLInt);
    const query = 'query($text: String) { getProducts(text: $text) { id name } }';
    const result = await graphql(schema, query, {}, {}, { text: 'my' });
    expect(result).to.eql({ data: { getProducts: [] } });
    expect(called).to.eql(true);
  });
});
