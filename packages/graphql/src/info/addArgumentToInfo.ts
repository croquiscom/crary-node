import {
  FieldNode,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLResolveInfo,
  Kind,
  KindEnum,
  TypeNode,
  ValueNode,
} from 'graphql';

export interface IAddArgumentToInfoOptions {
  path?: string;
  as_value?: boolean;
}

function valueToNode(value: any, type: GraphQLInputType): ValueNode {
  if (type instanceof GraphQLNonNull) {
    return valueToNode(value, type.ofType);
  } else if (type instanceof GraphQLList) {
    if (!Array.isArray(value)) {
      throw new Error('Value is not array');
    }
    return {
      kind: Kind.LIST,
      values: value.map((item) => valueToNode(item, type.ofType)),
    };
  } else {
    let kind: KindEnum;
    if (type === GraphQLInt) {
      kind = Kind.INT;
    } else if (type === GraphQLFloat) {
      kind = Kind.FLOAT;
    } else if (type === GraphQLBoolean) {
      kind = Kind.BOOLEAN;
    } else if (type instanceof GraphQLEnumType) {
      kind = Kind.ENUM;
    } else {
      throw new Error('unknow type: ' + type.toString());
    }
    return {
      kind,
      value,
    };
  }
}

function addArgumentToFieldNodeAsValue(
  fieldNode: FieldNode,
  path: string[],
  name: string,
  value: any,
  type: GraphQLInputType,
): FieldNode {
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
          value: valueToNode(value, type),
        },
      ],
    };
  }

  if (!fieldNode.selectionSet) {
    return fieldNode;
  }

  const selections = fieldNode.selectionSet.selections.map((selection) => {
    if (selection.kind === 'Field' && selection.name.value === path[0]) {
      return addArgumentToFieldNodeAsValue(selection, path.slice(1), name, value, type);
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

function typeToAst(type: GraphQLInputType): TypeNode {
  if (type instanceof GraphQLNonNull) {
    const innerType = typeToAst(type.ofType);
    if (innerType.kind === Kind.LIST_TYPE || innerType.kind === Kind.NAMED_TYPE) {
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
  info: T,
  name: string,
  value: any,
  type: GraphQLInputType,
  options: IAddArgumentToInfoOptions = {},
): T {
  if (options.as_value) {
    const path = options.path ? options.path.split('.') : [];
    const fieldNode = addArgumentToFieldNodeAsValue(info.fieldNodes[0], path, name, value, type);
    return {
      ...info,
      fieldNodes: [fieldNode],
      operation: {
        ...info.operation,
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: [fieldNode],
        },
      },
    };
  } else {
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
}
