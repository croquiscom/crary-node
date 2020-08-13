// tslint:disable:object-literal-sort-keys variable-name

import { expect } from 'chai';
import { buildSchema, graphql, GraphQLResolveInfo } from 'graphql';
import { getFieldList } from '../../lib';

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
  expected: string[],
  variables: { [key: string]: any } | undefined,
  fieldName: string | string[],
) {
  const info = await getInfo(query, variables);
  const actual = getFieldList(info, fieldName);
  await graphql(schema, query, undefined, undefined, variables);
  expect(actual).to.eql(expected);
}

describe('getFieldList with field_path', () => {
  it('basic query', async () => {
    await test('{ someType { a b e { x } } }', ['x'], undefined, 'e');
  });

  it('get fields on scalar field', async () => {
    await test('{ scalarField }', [], undefined, 'e');
  });

  it('fragment', async () => {
    await test(
      `
      fragment Frag on SomeType {
        a
        e { x }
      }
      { someType { ...Frag } }
      `,
      ['x'], undefined, 'e',
    );
  });

  it('inline fragment', async () => {
    await test(
      `
      { someType { ...on SomeType { a e { x } } } }
      `,
      ['x'], undefined, 'e',
    );
  });

  it('@include false', async () => {
    await test(
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
      [], undefined, 'e',
    );
  });

  it('@include true', async () => {
    await test(
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
      ['x'], undefined, 'e',
    );
  });

  it('@skip false', async () => {
    await test(
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
      ['x'], undefined, 'e',
    );
  });

  it('@skip true', async () => {
    await test(
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
      [], undefined, 'e',
    );
  });

  it('@include variable false', async () => {
    await test(
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
      'e',
    );
  });

  it('@skip variable true', async () => {
    await test(
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
      'e',
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
        e {
          x
        }
      }
      `,
      ['x'], undefined, 'e',
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
            e {
              x
            }
            x
          }
        }
      }
      `,
      ['e.x', 'x'], undefined, 'e',
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
              e {
                x
              }
            }
            x
          }
        }
      }
      `,
      ['e.e.x', 'x'], undefined, 'e',
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
      ['e.e.e.e.x'], undefined, 'e',
    );
  });

  it('works with length-1 array input', () => test(`{
    someType {
      e {
        e {
          e {
            e {
              e {
                x
              }
            }
            x
          }
        }
        x
      }
    }
  }`, ['e.e.e.e.x', 'e.e.x', 'x'], undefined, ['e']));

  it('works with length-2 array input', () => test(`{
    someType {
      e {
        e {
          e {
            e {
              e {
                x
              }
            }
            x
          }
        }
        x
      }
    }
  }`, ['e.e.e.x', 'e.x'], undefined, ['e', 'e']));

  it('works with length-3 array input', () => test(`{
    someType {
      e {
        e {
          e {
            e {
              e {
                x
              }
            }
            x
          }
        }
        x
      }
    }
  }`, ['e.e.x', 'x'], undefined, ['e', 'e', 'e']));
});
