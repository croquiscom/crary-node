import { expect } from 'chai';
import { buildSchema, DocumentNode, graphql, GraphQLInt, GraphQLResolveInfo, Kind, print } from 'graphql';
import { hookResolver } from '../..';

const schema = buildSchema(`
type Product {
  id: Int
  name: String
}

type Query {
  getProducts(text: String): [Product!]!
}
`);

describe('hookResolver', () => {
  it('hook', async () => {
    let called = false;
    const originalResolve = (source: any, args: any, context: any, info: GraphQLResolveInfo) => {
      expect(called).to.eql(false);
      expect(args).to.eql({ text: 'my' });
      const document: DocumentNode = {
        definitions: [info.operation],
        kind: Kind.DOCUMENT,
      };
      const expected = 'query ($_c_limit: Int) { getProducts(limit: $_c_limit) { id name } }';
      expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
      called = true;
      return [];
    };
    schema.getQueryType()!.getFields().getProducts.resolve = originalResolve;
    hookResolver(schema.getQueryType()!.getFields().getProducts, async (source, args, context, info, resolve) => {
      info = info.addArgument('limit', 5, GraphQLInt).removeArgument('text');
      return await resolve(source, args, context, info);
    });
    const query = 'query($text: String) { getProducts(text: $text) { id name } }';
    const result = await graphql(schema, query, {}, {}, { text: 'my' });
    expect(result).to.eql({ data: { getProducts: [] } });
    expect(called).to.eql(true);
  });
});
