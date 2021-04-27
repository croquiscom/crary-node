import { expect } from 'chai';
import { buildSchema, DocumentNode, graphql, GraphQLResolveInfo, Kind, print } from 'graphql';
import { getFieldList, removeFieldFromInfo, wrapInfo } from '../..';

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

describe('removeFieldFromInfo', () => {
  it('remove', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(
      schema,
      'query($text: String) { getProducts(text: $text) { id name } }',
      {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      {},
      { text: 'my' },
    );
    expect(getFieldList(info)).to.eql(['id', 'name']);
    const newInfo = removeFieldFromInfo(info, 'id');
    expect(getFieldList(newInfo)).to.eql(['name']);
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('not exist', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(
      schema,
      'query($text: String) { getProducts(text: $text) { name } }',
      {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      {},
      { text: 'my' },
    );
    const newInfo = removeFieldFromInfo(info, 'id');
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('remove in path', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(
      schema,
      'query($text: String) { getProducts(text: $text) { name supplier { id name } } }',
      {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      {},
      { text: 'my' },
    );
    const newInfo = removeFieldFromInfo(info, 'id', { path: 'supplier' });
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { name supplier { name } } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('wrap', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(
      schema,
      'query($text: String) { getProducts(text: $text) { id name } }',
      {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      {},
      { text: 'my' },
    );
    const newInfo = wrapInfo(info).removeField('id');
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('using fragment', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(
      schema,
      'fragment ProductFragment on Product { id name } query($text: String) { getProducts(text: $text) { ...ProductFragment } }',
      {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      {},
      { text: 'my' },
    );
    expect(getFieldList(info)).to.eql(['id', 'name']);
    const newInfo = removeFieldFromInfo(info, 'id');
    expect(getFieldList(newInfo)).to.eql(['name']);
    const document: DocumentNode = {
      definitions: [...Object.values(newInfo.fragments), newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected =
      'fragment ProductFragment on Product { name } query ($text: String) { getProducts(text: $text) { ...ProductFragment } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });
});
