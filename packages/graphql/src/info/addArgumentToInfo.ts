import { FieldNode, GraphQLInputType, GraphQLList, GraphQLNonNull, GraphQLResolveInfo, Kind, TypeNode } from 'graphql';

export interface IAddArgumentToInfoOptions {
  path?: string;
}

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

function addArgumentToFieldNode(fieldNode: FieldNode, path: string[], name: string, variable_name: string): FieldNode {
  if (path.length === 0) {
    return {
      ...fieldNode,
      arguments: [
        ...(fieldNode.arguments || []),
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
              value: variable_name,
            },
          },
        },
      ],
    };
  }

  if (!fieldNode.selectionSet) {
    return fieldNode;
  }

  const selections = fieldNode.selectionSet.selections.map((selection) => {
    if (selection.kind === 'Field' && selection.name.value === path[0]) {
      return addArgumentToFieldNode(selection, path.slice(1), name, variable_name);
    }
    return selection;
  });
  return {
    ...fieldNode,
    selectionSet: {
      ...fieldNode.selectionSet,
      selections,
    },
  };
}

export function addArgumentToInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(
  info: T, name: string, value: any, type: GraphQLInputType, options: IAddArgumentToInfoOptions = {},
): T {
  const variable_name = `_c_${name}`;
  const variableDefinitions = [
    ...(info.operation.variableDefinitions || []),
    {
      kind: Kind.VARIABLE_DEFINITION,
      type: typeToAst(type),
      variable: {
        kind: Kind.VARIABLE,
        name: {
          kind: Kind.NAME,
          value: variable_name,
        },
      },
    },
  ];
  const path = options.path ? options.path.split('.') : [];
  const fieldNode = addArgumentToFieldNode(info.fieldNodes[0], path, name, variable_name);
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
      [variable_name]: value,
    },
  };
}
