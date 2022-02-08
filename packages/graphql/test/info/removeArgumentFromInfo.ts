import { expect } from 'chai';
import { buildSchema, DocumentNode, graphql, GraphQLResolveInfo, Kind, print } from 'graphql';
import { removeArgumentFromInfo, wrapInfo } from '../..';

const schema = buildSchema(`
type Product {
  id: Int
  name: String
}

type Query {
  getProducts(text: String): [Product!]!
}
`);

describe('removeArgumentFromInfo', () => {
  it('remove', async () => {
    let info!: GraphQLResolveInfo;
    await graphql({
      schema,
      source: 'query($text: String) { getProducts(text: $text) { id name } }',
      rootValue: {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      contextValue: {},
      variableValues: { text: 'my' },
    });
    const newInfo = removeArgumentFromInfo(info, 'text');
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = '{ getProducts { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('remove value', async () => {
    let info!: GraphQLResolveInfo;
    await graphql({
      schema,
      source: '{ getProducts(text: "FOOBAR") { id name } }',
      rootValue: {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
    });
    const newInfo = removeArgumentFromInfo(info, 'text');
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = '{ getProducts { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('remove non-exist', async () => {
    let info!: GraphQLResolveInfo;
    await graphql({
      schema,
      source: 'query($text: String) { getProducts(text: $text) { id name } }',
      rootValue: {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      contextValue: {},
      variableValues: { text: 'my' },
    });
    const newInfo = removeArgumentFromInfo(info, 'limit');
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('wrap', async () => {
    let info!: GraphQLResolveInfo;
    await graphql({
      schema,
      source: 'query($text: String) { getProducts(text: $text) { id name } }',
      rootValue: {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      contextValue: {},
      variableValues: { text: 'my' },
    });
    const newInfo = wrapInfo(info).removeArgument('text');
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = '{ getProducts { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });
});
