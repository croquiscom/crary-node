import { expect } from 'chai';
import { graphql, GraphQLBoolean, GraphQLInt, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { CrJson } from '../..';

describe('CrJson', () => {
  describe('serialize', () => {
    it('number', async () => {
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => 152.73,
              type: CrJson,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({ schema, source: '{ query }' });
      expect(result.data).to.eql({ query: 152.73 });
      expect(result).to.not.have.property('errors');
    });

    it('string', async () => {
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => 'hello',
              type: CrJson,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({ schema, source: '{ query }' });
      expect(result.data).to.eql({ query: 'hello' });
      expect(result).to.not.have.property('errors');
    });

    it('object', async () => {
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => ({ foo: 59.12, bar: 'hello', doe: null }),
              type: CrJson,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({ schema, source: '{ query }' });
      expect(result.data).to.eql({ query: { foo: 59.12, bar: 'hello', doe: null } });
      expect(result).to.not.have.property('errors');
    });
  });

  describe('parseValue', () => {
    it('number', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({
        schema,
        source: 'query($input: CrJson) { query(input: $input) }',
        variableValues: {
          input: 152.73,
        },
      });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.eql(152.73);
    });

    it('string', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({
        schema,
        source: 'query($input: CrJson) { query(input: $input) }',
        variableValues: {
          input: 'hello',
        },
      });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.eql('hello');
    });

    it('object', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({
        schema,
        source: 'query($input: CrJson) { query(input: $input) }',
        variableValues: {
          input: { foo: 59.12, bar: 'hello', doe: null },
        },
      });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.eql({ foo: 59.12, bar: 'hello', doe: null });
    });
  });

  describe('parseLiteral', () => {
    it('int', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({
        schema,
        source: `
          {
            query(input: 152)
          }
        `,
      });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.eql(152);
    });

    it('float', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({
        schema,
        source: `
          {
            query(input: 152.73)
          }
        `,
      });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.eql(152.73);
    });

    it('string', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({
        schema,
        source: `
          {
            query(input: "hello")
          }
        `,
      });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.eql('hello');
    });

    it('null', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({
        schema,
        source: `
          {
            query(input: null)
          }
        `,
      });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.eql(null);
    });

    it('boolean', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({
        schema,
        source: `
          {
            query(input: true)
          }
        `,
      });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.eql(true);
    });

    it('enum', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({
        schema,
        source: `
          {
            query(input: ACCEPT)
          }
        `,
      });
      expect(result.data).to.eql(undefined);
      const msg = 'Do not support EnumValue type';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });

    it('complicate', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrJson,
                },
              },
              resolve: (_, { input }) => {
                value = input;
                return true;
              },
              type: GraphQLBoolean,
            },
          },
          name: 'Query',
        }),
        types: [GraphQLInt],
      });
      const result = await graphql({
        schema,
        source: `
          query($var: Int) {
            query(
              input: {
                string: "string"
                int: 152
                float: 152.73
                true: true
                false: false
                null: null
                var: $var
                nested: { string: "string", float: 152.73, var: $var }
                list: ["string", null, $var, true, 152.73]
              }
            )
          }
        `,
        variableValues: { var: 59 },
      });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.eql({
        false: false,
        float: 152.73,
        int: 152,
        list: ['string', null, 59, true, 152.73],
        nested: {
          float: 152.73,
          string: 'string',
          var: 59,
        },
        null: null,
        string: 'string',
        true: true,
        var: 59,
      });
    });
  });
});
