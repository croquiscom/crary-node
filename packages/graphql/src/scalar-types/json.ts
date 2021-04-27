import { GraphQLScalarType, ValueNode } from 'graphql';
import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';

function parseLiteral(valueAST: ValueNode, variables: { [key: string]: any } | undefined | null): any {
  switch (valueAST.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return valueAST.value;

    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(valueAST.value);

    case Kind.NULL:
      return null;

    case Kind.OBJECT: {
      const result: any = {};
      valueAST.fields.forEach((field) => {
        result[field.name.value] = parseLiteral(field.value, variables);
      });
      return result;
    }

    case Kind.LIST:
      return valueAST.values.map((v) => parseLiteral(v, variables));

    case Kind.VARIABLE:
      return variables ? variables[valueAST.name.value] : undefined;
  }
  throw new GraphQLError(`Do not support ${valueAST.kind} type`);
}

export const CrJson = new GraphQLScalarType({
  name: 'CrJson',

  description: 'Serve JSON object',

  serialize(value) {
    return value;
  },

  parseValue(value) {
    return value;
  },

  parseLiteral,
});
