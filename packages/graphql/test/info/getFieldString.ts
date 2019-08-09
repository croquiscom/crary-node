// tslint:disable:object-literal-sort-keys variable-name

import { expect } from 'chai';
import { buildSchema, graphql, GraphQLResolveInfo } from 'graphql';
import { getFieldString } from '../..';

const schema = buildSchema(`
type NestedType {
  x: String
  e: NestedType
}

enum RGB {
  RED
  GREEN
  BLUE
}

input NestedInput {
  g: RGB
  h: Boolean
}

type SomeType {
  a(y: String, z: NestedInput): String
  b: String
  c: String
  d: String
  e: NestedType
}

type Query {
  scalarField: String
  someType: SomeType
}
`);

async function getInfo(query: string, variables: { [key: string]: any } | undefined) {
  let info!: GraphQLResolveInfo;
  await graphql(schema, query, {
    scalarField: (args: any, context: any, _info: GraphQLResolveInfo) => {
      info = _info;
      return 'str';
    },
    someType: (args: any, context: any, _info: GraphQLResolveInfo) => {
      info = _info;
      return { a: 1, b: 2, c: 3, d: 4, e: { x: 'str' } };
    },
  }, {}, variables);
  return info;
}

async function test(
  query: string,
  expected: string,
  variables: { [key: string]: any } | undefined,
) {
  const info = await getInfo(query, variables);
  const actual = getFieldString(info);
  expect(actual).to.eql(expected);
}

describe('getFieldString', () => {
  it('basic query', async () => {
    await test('{ someType { a b } }', 'a b', undefined);
  });

  it('get fields on scalar field', async () => {
    await test('{ scalarField }', '', undefined);
  });

  it('argument', async () => {
    await test(`
      {
        someType {
          a(y: "text", z: { g: RED, h: false })
          b
        }
      }
    `, 'a(y: "text", z: { g: RED, h: false }) b', undefined);
  });

  it('argument (with variables)', async () => {
    await test(`
      query($y: String) {
        someType {
          a(y: $y)
          b
        }
      }
    `, 'a(y: $y) b', { value: 'text' });
  });

  it('fragment', async () => {
    await test(
      `
      fragment Frag on SomeType {
        a
      }
      { someType { ...Frag } }
      `,
      'a', undefined,
    );
  });

  it('inline fragment', async () => {
    await test(
      `
      { someType { ...on SomeType { a } } }
      `,
      '... on SomeType { a }', undefined,
    );
  });

  it('@include false', async () => {
    await test(
      `
      {
        someType {
          a
          b @include(if: false)
        }
      }
      `,
      'a', undefined,
    );
  });

  it('@include true', async () => {
    await test(
      `
      {
        someType {
          a
          b @include(if: true)
        }
      }
      `,
      'a b', undefined,
    );
  });

  it('@skip false', async () => {
    await test(
      `
      {
        someType {
          a
          b @skip(if: false)
        }
      }
      `,
      'a b', undefined,
    );
  });

  it('@skip true', async () => {
    await test(
      `
      {
        someType {
          a
          b @skip(if: true)
        }
      }
      `,
      'a', undefined,
    );
  });

  it('@include false @skip false', async () => {
    await test(
      `
      {
        someType {
          b @include(if: false) @skip(if: false)
        }
      }
      `,
      '', undefined,
    );
  });

  it('@include false @skip true', async () => {
    await test(
      `
      {
        someType {
          b @include(if: false) @skip(if: true)
        }
      }
      `,
      '', undefined,
    );
  });

  it('@include true @skip false', async () => {
    await test(
      `
      {
        someType {
          b @include(if: true) @skip(if: false)
        }
      }
      `,
      'b', undefined,
    );
  });

  it('@include true @skip true', async () => {
    await test(
      `
      {
        someType {
          b @include(if: true) @skip(if: true)
        }
      }
      `,
      '', undefined,
    );
  });
  it('@include variable false', async () => {
    await test(
      `
      query($test: Boolean!){
        someType {
          b @include(if: $test)
        }
      }
      `,
      '',
      { test: false },
    );
  });

  it('@skip variable true', async () => {
    await test(
      `
      query($test: Boolean!){
        someType {
          b @skip(if: $test)
        }
      }
      `,
      '',
      { test: true },
    );
  });

  it('nested fragments', async () => {
    await test(
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
      'a b', undefined,
    );
  });

  it('works with nested types', async () => {
    await test(
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
      'a b e { x }', undefined,
    );
  });

  it('works with doubly nested types', async () => {
    await test(
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
      'a b e { e { x } }', undefined,
    );
  });

  it('works with nested types and fragments', async () => {
    await test(
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
      'a b e { x }', undefined,
    );
  });

  it('works with nested types and inline fragments', async () => {
    await test(
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
      'a b e { ... on NestedType { x } }', undefined,
    );
  });

  it('works with super duper nested types', async () => {
    await test(
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
      'a b e { e { e { e { e { x } } } } }', undefined,
    );
  });
});
