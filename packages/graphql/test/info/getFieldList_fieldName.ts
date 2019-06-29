// tslint:disable:object-literal-sort-keys variable-name

import { expect } from 'chai';
import {
  graphql, GraphQLBoolean, GraphQLEnumType, GraphQLInputObjectType,
  GraphQLObjectType, GraphQLResolveInfo, GraphQLSchema, GraphQLString,
} from 'graphql';
import { getFieldList } from '../..';

async function testGetFields(
  query: string,
  expected: string[],
  variables: { [key: string]: any } | undefined,
  func: (info: GraphQLResolveInfo) => string[],
) {
  let actual;
  function resolver(parent: any, args: { [key: string]: any }, context: any, info: GraphQLResolveInfo) {
    actual = func(info);
    return { a: 1, b: 2, c: 3, d: 4, e: { a: 5 } };
  }
  const EType: GraphQLObjectType = new GraphQLObjectType({
    name: 'NestedType',
    fields: () => ({
      x: { type: GraphQLString },
      e: { type: EType },
    }),
  });
  const GEnum = new GraphQLEnumType({
    name: 'RGB',
    values: {
      RED: { value: 0 },
      GREEN: { value: 1 },
      BLUE: { value: 2 },
    },
  });
  const ZInput = new GraphQLInputObjectType({
    name: 'NestedInput',
    fields: () => ({
      g: { type: GEnum },
      h: { type: GraphQLBoolean },
    }),
  });
  const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      scalarField: {
        type: GraphQLString,
        resolve: resolver,
      },
      someType: {
        type: new GraphQLObjectType({
          name: 'SomeType',
          fields: {
            a: { type: GraphQLString, args: { y: { type: GraphQLString }, z: { type: ZInput } } },
            b: { type: GraphQLString },
            c: { type: GraphQLString },
            d: { type: GraphQLString },
            e: { type: EType },
          },
        }),
        resolve: resolver,
      },
    },
  });
  const schema = new GraphQLSchema({ query: QueryType });

  await graphql(schema, query, undefined, undefined, variables);
  expect(actual).to.eql(expected);
}

describe('getFieldList with fieldName', () => {
  it('basic query', async () => {
    await testGetFields('{ someType { a b e { x } } }', ['x'], undefined, (info) => getFieldList(info, 'e'));
  });

  it('get fields on scalar field', async () => {
    await testGetFields('{ scalarField }', [], undefined, (info) => getFieldList(info, 'e'));
  });

  it('fragment', async () => {
    await testGetFields(
      `
      fragment Frag on SomeType {
        a
        e { x }
      }
      { someType { ...Frag } }
      `,
      ['x'], undefined, (info) => getFieldList(info, 'e'),
    );
  });

  it('inline fragment', async () => {
    await testGetFields(
      `
      { someType { ...on SomeType { a e { x } } } }
      `,
      ['x'], undefined, (info) => getFieldList(info, 'e'),
    );
  });

  it('@include false', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          e {
            x @include(if: false)
          }
        }
      }
      `,
      [], undefined, (info) => getFieldList(info, 'e'),
    );
  });

  it('@include true', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          e {
            x @include(if: true)
          }
        }
      }
      `,
      ['x'], undefined, (info) => getFieldList(info, 'e'),
    );
  });

  it('@skip false', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          e {
            x @skip(if: false)
          }
        }
      }
      `,
      ['x'], undefined, (info) => getFieldList(info, 'e'),
    );
  });

  it('@skip true', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          e {
            x @skip(if: true)
          }
        }
      }
      `,
      [], undefined, (info) => getFieldList(info, 'e'),
    );
  });

  it('@include variable false', async () => {
    await testGetFields(
      `
      query($test: Boolean!){
        someType {
          e {
            x @include(if: $test)
          }
        }
      }
      `,
      [],
      { test: false },
      (info) => getFieldList(info, 'e'),
    );
  });

  it('@skip variable true', async () => {
    await testGetFields(
      `
      query($test: Boolean!){
        someType {
          e {
            x @skip(if: $test)
          }
        }
      }
      `,
      [],
      { test: true },
      (info) => getFieldList(info, 'e'),
    );
  });

  it('nested fragments', async () => {
    await testGetFields(
      `
      {
        someType {
          ...L1
        }
      }
      fragment L1 on SomeType {
        a
        ...L2
      }
      fragment L2 on SomeType {
        e {
          x
        }
      }
      `,
      ['x'], undefined, (info) => getFieldList(info, 'e'),
    );
  });

  it('works with nested types', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          b
          e {
            e {
              x
            }
            x
          }
        }
      }
      `,
      ['e.x', 'x'], undefined, (info) => getFieldList(info, 'e'),
    );
  });

  it('works with doubly nested types', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          b
          e {
            e {
              e {
                x
              }
            }
            x
          }
        }
      }
      `,
      ['e.e.x', 'x'], undefined, (info) => getFieldList(info, 'e'),
    );
  });

  it('works with super duper nested types', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          b
          e {
            e {
              e {
                e {
                  e {
                    x
                  }
                }
              }
            }
          }
        }
      }
      `,
      ['e.e.e.e.x'], undefined, (info) => getFieldList(info, 'e'),
    );
  });
});
