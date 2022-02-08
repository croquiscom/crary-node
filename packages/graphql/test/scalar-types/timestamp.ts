import { expect } from 'chai';
import { graphql, GraphQLBoolean, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { CrTimestamp } from '../..';

describe('CrTimestamp', () => {
  describe('serialize', () => {
    it('valid date', async () => {
      const date = new Date(2018, 9, 12, 5, 20);
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => date,
              type: CrTimestamp,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({ schema, source: '{ query }' });
      expect(result.data).to.eql({ query: date.getTime() });
      expect(result).to.not.have.property('errors');
    });

    it('invalid date', async () => {
      const date = new Date('a');
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => date,
              type: CrTimestamp,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({ schema, source: '{ query }' });
      expect(result.data).to.eql({ query: null });
      expect(result.errors![0].message).to.eql('Value is not a valid Date');
    });

    it('timestamp is valid', async () => {
      const date = new Date(2018, 9, 12, 5, 20);
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              resolve: () => date.getTime(),
              type: CrTimestamp,
            },
          },
          name: 'Query',
        }),
      });
      const result = await graphql({ schema, source: '{ query }' });
      expect(result.data).to.eql({ query: date.getTime() });
      expect(result).to.not.have.property('errors');
    });
  });

  describe('parseValue', () => {
    it('valid date', async () => {
      const date = new Date(2018, 9, 12, 5, 20);
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrTimestamp,
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
        source: 'query($input: CrTimestamp) { query(input: $input) }',
        variableValues: {
          input: date.getTime(),
        },
      });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.instanceof(Date);
      expect(value).to.eql(date);
    });

    it('invalid date - date string', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrTimestamp,
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
        source: 'query($input: CrTimestamp) { query(input: $input) }',
        variableValues: {
          input: new Date('2021-01-15T04:20Z').toISOString(),
        },
      });
      expect(result.data).to.eql(undefined);
      const msg =
        'Variable "$input" got invalid value "2021-01-15T04:20:00.000Z"; Expected type "CrTimestamp". Value is not a valid timestamp: 2021-01-15T04:20:00.000Z';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });

    it('invalid date - normal string', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrTimestamp,
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
        source: 'query($input: CrTimestamp) { query(input: $input) }',
        variableValues: {
          input: 'a',
        },
      });
      expect(result.data).to.eql(undefined);
      const msg =
        'Variable "$input" got invalid value "a"; Expected type "CrTimestamp". Value is not a valid timestamp: a';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });
  });

  describe('parseLiteral', () => {
    it('valid timestamp', async () => {
      const date = new Date(2018, 9, 12, 5, 20);
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrTimestamp,
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
      const result = await graphql({ schema, source: `{ query(input: ${date.getTime()}) }` });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.instanceof(Date);
      expect(value).to.eql(date);
    });

    it('invalid date - enum', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrTimestamp,
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
            query(input: a)
          }
        `,
      });
      expect(result.data).to.eql(undefined);
      const msg = 'Can only parse numbers but got a: EnumValue';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });

    it('invalid date - string', async () => {
      let value;
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          fields: {
            query: {
              args: {
                input: {
                  type: CrTimestamp,
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
            query(input: "2021-01-15T04:20Z")
          }
        `,
      });
      expect(result.data).to.eql(undefined);
      const msg = 'Can only parse numbers but got a: StringValue';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });
  });
});
