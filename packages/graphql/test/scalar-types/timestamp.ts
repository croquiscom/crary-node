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
      const result = await graphql(schema, '{ query }');
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
      const result = await graphql(schema, '{ query }');
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
      const result = await graphql(schema, '{ query }');
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
      const result = await graphql(schema, 'query($input: CrTimestamp) { query(input: $input) }',
        null, null, { input: date.getTime() });
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.instanceof(Date);
      expect(value).to.eql(date);
    });

    it('invalid date', async () => {
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
      const result = await graphql(schema, 'query($input: CrTimestamp) { query(input: $input) }',
        null, null, { input: 'a' });
      expect(result.data).to.eql(undefined);
      const msg = 'Variable "$input" got invalid value "a"; Expected type "CrTimestamp". Value is not a valid Date: a';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });
  });

  describe('parseLiteral', () => {
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
      const result = await graphql(schema, `{ query(input: ${date.getTime()}) }`);
      expect(result.data).to.eql({ query: true });
      expect(result).to.not.have.property('errors');
      expect(value).to.instanceof(Date);
      expect(value).to.eql(date);
    });

    it('invalid date', async () => {
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
      const result = await graphql(schema, `{ query(input: a) }`);
      expect(result.data).to.eql(undefined);
      const msg = 'Can only parse numbers but got a: EnumValue';
      expect(result.errors![0].message).to.eql(msg);
      expect(value).to.eql(undefined);
    });
  });
});
