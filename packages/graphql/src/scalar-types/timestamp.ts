import { GraphQLScalarType } from 'graphql';
import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';

export const CrTimestamp = new GraphQLScalarType({
  name: 'CrTimestamp',

  description: 'Serve Date object as timestamp',

  serialize(value) {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        throw new TypeError('Value is not a valid Date');
      }
      return value.getTime();
    } else if (typeof value === 'number') {
      return value;
    } else {
      throw new TypeError(`Value is not an instance of Date or number: ${value}`);
    }
  },

  parseValue(value) {
    if (typeof value !== 'number') {
      throw new TypeError(`Value is not a valid timestamp: ${value}`);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`Value is not a valid Date: ${value}`);
    }

    return date;
  },

  parseLiteral(valueAST) {
    if (valueAST.kind !== Kind.INT && valueAST.kind !== Kind.FLOAT) {
      throw new GraphQLError(`Can only parse numbers but got a: ${valueAST.kind}`);
    }

    const result = new Date(Number(valueAST.value));

    if (Number.isNaN(result.getTime())) {
      throw new GraphQLError(`Value is not a valid Date: ${valueAST.value}`);
    }

    return result;
  },
});
