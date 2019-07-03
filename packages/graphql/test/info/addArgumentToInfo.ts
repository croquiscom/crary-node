import { expect } from 'chai';
import { buildSchema, DocumentNode, graphql, GraphQLInt, GraphQLResolveInfo, Kind, print } from 'graphql';
import { addArgumentToInfo, wrapInfo } from '../..';

const schema = buildSchema(`
type Product {
  id: Int
  name: String
}

type Query {
  getProducts(text: String): [Product!]!
}
`);

describe('addArgumentToInfo', () => {
  it('add', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(schema, 'query($text: String) { getProducts(text: $text) { id name } }', {
      getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
        info = _info;
      },
    }, {}, { text: 'my' });
    const newInfo = addArgumentToInfo(info, 'limit', 5, GraphQLInt);
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String, $_c_limit: Int) { getProducts(text: $text, limit: $_c_limit) { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('add to empty argument', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(schema, '{ getProducts { id name } }', {
      getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
        info = _info;
      },
    }, {}, { text: 'my' });
    const newInfo = addArgumentToInfo(info, 'limit', 5, GraphQLInt);
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($_c_limit: Int) { getProducts(limit: $_c_limit) { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('wrap', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(schema, 'query($text: String) { getProducts(text: $text) { id name } }', {
      getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
        info = _info;
      },
    }, {}, { text: 'my' });
    const newInfo = wrapInfo(info).addArgument('limit', 5, GraphQLInt);
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String, $_c_limit: Int) { getProducts(text: $text, limit: $_c_limit) { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });
});
