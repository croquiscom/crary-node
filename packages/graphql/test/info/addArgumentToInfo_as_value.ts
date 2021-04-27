import { expect } from 'chai';
import { buildSchema, DocumentNode, graphql, GraphQLInt, GraphQLResolveInfo, Kind, print } from 'graphql';
import { addArgumentToInfo, wrapInfo } from '../..';

const schema = buildSchema(`
type Supplier {
  id: Int
  name: String
}

type Product {
  id: Int
  name: String
  supplier: Supplier
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
    const newInfo = addArgumentToInfo(info, 'limit', 5, GraphQLInt, { as_value: true });
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text, limit: 5) { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('add to empty argument', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(schema, '{ getProducts { id name } }', {
      getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
        info = _info;
      },
    }, {}, { text: 'my' });
    const newInfo = addArgumentToInfo(info, 'limit', 5, GraphQLInt, { as_value: true });
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = '{ getProducts(limit: 5) { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('add in path', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(schema, 'query($text: String) { getProducts(text: $text) { id name } }', {
      getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
        info = _info;
      },
    }, {}, { text: 'my' });
    const newInfo = addArgumentToInfo(info, 'limit', 5, GraphQLInt, { path: 'name', as_value: true });
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { id name(limit: 5) } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('add in deep path', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(schema, 'query($text: String) { getProducts(text: $text) { id name supplier { id name } } }', {
      getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
        info = _info;
      },
    }, {}, { text: 'my' });
    const newInfo = addArgumentToInfo(info, 'limit', 5, GraphQLInt, { path: 'supplier.name', as_value: true });
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { id name supplier { id name(limit: 5) } } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('wrap', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(schema, 'query($text: String) { getProducts(text: $text) { id name } }', {
      getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
        info = _info;
      },
    }, {}, { text: 'my' });
    const newInfo = wrapInfo(info).addArgument('limit', 5, GraphQLInt, { as_value: true });
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text, limit: 5) { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });
});
