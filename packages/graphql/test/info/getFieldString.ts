// tslint:disable:object-literal-sort-keys variable-name

import { expect } from 'chai';
import {
  graphql, GraphQLBoolean, GraphQLEnumType, GraphQLInputObjectType,
  GraphQLObjectType, GraphQLResolveInfo, GraphQLSchema, GraphQLString,
} from 'graphql';
import { getFieldString } from '../..';

async function testGetFields(
  query: string,
  expected: string,
  variables: { [key: string]: any } | undefined,
  func: (info: GraphQLResolveInfo) => string,
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

describe('getFieldString', () => {
  it('basic query', async () => {
    await testGetFields('{ someType { a b } }', 'a b', undefined, getFieldString);
  });

  it('get fields on scalar field', async () => {
    await testGetFields('{ scalarField }', '', undefined, getFieldString);
  });

  it('argument', async () => {
    await testGetFields(`
      {
        someType {
          a(y: "text", z: { g: RED, h: false })
          b
        }
      }
    `, 'a(y: "text", z: { g: RED, h: false }) b', undefined, getFieldString);
  });

  it('argument (with variables)', async () => {
    await testGetFields(`
      query($y: String) {
        someType {
          a(y: $y)
          b
        }
      }
    `, 'a(y: $y) b', { value: 'text' }, getFieldString);
  });

  it('fragment', async () => {
    await testGetFields(
      `
      fragment Frag on SomeType {
        a
      }
      { someType { ...Frag } }
      `,
      'a', undefined, getFieldString,
    );
  });

  it('inline fragment', async () => {
    await testGetFields(
      `
      { someType { ...on SomeType { a } } }
      `,
      '... on SomeType { a }', undefined, getFieldString,
    );
  });

  it('@include false', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          b @include(if: false)
        }
      }
      `,
      'a', undefined, getFieldString,
    );
  });

  it('@include true', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          b @include(if: true)
        }
      }
      `,
      'a b', undefined, getFieldString,
    );
  });

  it('@skip false', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          b @skip(if: false)
        }
      }
      `,
      'a b', undefined, getFieldString,
    );
  });

  it('@skip true', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          b @skip(if: true)
        }
      }
      `,
      'a', undefined, getFieldString,
    );
  });

  it('@include false @skip false', async () => {
    await testGetFields(
      `
      {
        someType {
          b @include(if: false) @skip(if: false)
        }
      }
      `,
      '', undefined, getFieldString,
    );
  });

  it('@include false @skip true', async () => {
    await testGetFields(
      `
      {
        someType {
          b @include(if: false) @skip(if: true)
        }
      }
      `,
      '', undefined, getFieldString,
    );
  });

  it('@include true @skip false', async () => {
    await testGetFields(
      `
      {
        someType {
          b @include(if: true) @skip(if: false)
        }
      }
      `,
      'b', undefined, getFieldString,
    );
  });

  it('@include true @skip true', async () => {
    await testGetFields(
      `
      {
        someType {
          b @include(if: true) @skip(if: true)
        }
      }
      `,
      '', undefined, getFieldString,
    );
  });
  it('@include variable false', async () => {
    await testGetFields(
      `
      query($test: Boolean!){
        someType {
          b @include(if: $test)
        }
      }
      `,
      '',
      { test: false },
      getFieldString,
    );
  });

  it('@skip variable true', async () => {
    await testGetFields(
      `
      query($test: Boolean!){
        someType {
          b @skip(if: $test)
        }
      }
      `,
      '',
      { test: true },
      getFieldString,
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
        b
      }
      `,
      'a b', undefined, getFieldString,
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
            x
          }
        }
      }
      `,
      'a b e { x }', undefined, getFieldString,
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
              x
            }
          }
        }
      }
      `,
      'a b e { e { x } }', undefined, getFieldString,
    );
  });

  it('works with nested types and fragments', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          b
          e {
            ...F1
          }
        }
      }
      fragment F1 on NestedType {
        x
      }
      `,
      'a b e { x }', undefined, getFieldString,
    );
  });

  it('works with nested types and inline fragments', async () => {
    await testGetFields(
      `
      {
        someType {
          a
          b
          e {
            ... on NestedType {
              x
            }
          }
        }
      }
      `,
      'a b e { ... on NestedType { x } }', undefined, getFieldString,
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
      'a b e { e { e { e { e { x } } } } }', undefined, getFieldString,
    );
  });
});
