// tslint:disable:object-literal-sort-keys variable-name

import { expect } from 'chai';
import {
  graphql, GraphQLBoolean, GraphQLEnumType, GraphQLInputObjectType,
  GraphQLObjectType, GraphQLResolveInfo, GraphQLSchema, GraphQLString,
} from 'graphql';
import { getFieldList } from '../..';

async function testGetFields(
  query: string,
  expected: any,
  variables?: { [key: string]: any },
  func: (info: GraphQLResolveInfo) => string[] = getFieldList,
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

describe('getFieldList', () => {
  it('basic query', async () => {
    await testGetFields('{ someType { a b } }', ['a', 'b']);
  });

  it('get fields on scalar field', async () => {
    await testGetFields('{ scalarField }', []);
  });

  it('fragment', async () => {
    await testGetFields(
      `
      fragment Frag on SomeType {
        a
      }
      { someType { ...Frag } }
      `,
      ['a'],
    );
  });

  it('inline fragment', async () => {
    await testGetFields(
      `
      { someType { ...on SomeType { a } } }
      `,
      ['a'],
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
      ['a'],
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
      ['a', 'b'],
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
      ['a', 'b'],
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
      ['a'],
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
      [],
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
      [],
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
      ['b'],
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
      [],
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
      [],
      { test: false },
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
      [],
      { test: true },
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
      ['a', 'b'],
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
      ['a', 'b', 'e.x'],
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
      ['a', 'b', 'e.e.x'],
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
      ['a', 'b', 'e.x'],
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
      ['a', 'b', 'e.x'],
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
      ['a', 'b', 'e.e.e.e.e.x'],
    );
  });

  it('handles undefined directives', () => {
    // Relevant ast info bits included
    const info: any = {
      fieldName: 'someType',
      fieldNodes: [
        {
          kind: 'Field',
          alias: null,
          name: {
            kind: 'Name',
            value: 'someType',
            loc: {
              start: 2,
              end: 10,
            },
          },
          arguments: [],
          directives: [],
          selectionSet: {
            kind: 'SelectionSet',
            selections: [
              {
                kind: 'Field',
                alias: null,
                name: {
                  kind: 'Name',
                  value: 'a',
                  loc: {
                    start: 13,
                    end: 14,
                  },
                },
                arguments: [],
                // deliberately excluded for test "directives": [],
                selectionSet: null,
                loc: {
                  start: 13,
                  end: 14,
                },
              },
              {
                kind: 'Field',
                alias: null,
                name: {
                  kind: 'Name',
                  value: 'b',
                  loc: {
                    start: 15,
                    end: 16,
                  },
                },
                arguments: [],
                directives: [],
                selectionSet: null,
                loc: {
                  start: 15,
                  end: 16,
                },
              },
            ],
            loc: {
              start: 11,
              end: 18,
            },
          },
          loc: {
            start: 2,
            end: 18,
          },
        },
      ],
      returnType: 'SomeType',
      parentType: 'Query',
      path: {
        key: 'someType',
      },
      fragments: {},
      variableValues: {},
    };

    expect(getFieldList(info)).to.eql(['a', 'b']);
  });
});
