import { GraphQLInputType, GraphQLList, GraphQLNonNull, GraphQLResolveInfo, Kind, TypeNode } from 'graphql';

function typeToAst(type: GraphQLInputType): TypeNode {
  if (type instanceof GraphQLNonNull) {
    const innerType = typeToAst(type.ofType);
    if (
      innerType.kind === Kind.LIST_TYPE ||
      innerType.kind === Kind.NAMED_TYPE
    ) {
      return {
        kind: Kind.NON_NULL_TYPE,
        type: innerType,
      };
    } else {
      throw new Error('Incorrect inner non-null type');
    }
  } else if (type instanceof GraphQLList) {
    return {
      kind: Kind.LIST_TYPE,
      type: typeToAst(type.ofType),
    };
  } else {
    return {
      kind: Kind.NAMED_TYPE,
      name: {
        kind: Kind.NAME,
        value: type.toString(),
      },
    };
  }
}

export function addArgumentToInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(
  info: T, name: string, value: any, type: GraphQLInputType,
): T {
  const varaiable_name = `_c_${name}`;
  const variableDefinitions = [
    ...(info.operation.variableDefinitions || []),
    {
      kind: Kind.VARIABLE_DEFINITION,
      type: typeToAst(type),
      variable: {
        kind: Kind.VARIABLE,
        name: {
          kind: Kind.NAME,
          value: varaiable_name,
        },
      },
    },
  ];
  const fieldNode = {
    ...info.fieldNodes[0],
    arguments: [
      ...(info.fieldNodes[0].arguments || []),
      {
        kind: Kind.ARGUMENT,
        name: {
          kind: Kind.NAME,
          value: name,
        },
        value: {
          kind: Kind.VARIABLE,
          name: {
            kind: Kind.NAME,
            value: varaiable_name,
          },
        },
      },
    ],
  };
  return {
    ...info,
    fieldNodes: [fieldNode],
    operation: {
      ...info.operation,
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [fieldNode],
      },
      variableDefinitions,
    },
    variableValues: {
      ...info.variableValues,
      [varaiable_name]: value,
    },
  };
}
