import { GraphQLResolveInfo, Kind, VariableNode } from 'graphql';

export function removeArgumentFromInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T, name: string): T {
  if (!info.fieldNodes[0].arguments) {
    return info;
  }
  const arg_to_remove = info.fieldNodes[0].arguments.find((arg) => {
    return arg.name.value === name;
  });
  if (!arg_to_remove) {
    return info;
  }
  if (arg_to_remove.value.kind === Kind.VARIABLE) {
    const variable_name = arg_to_remove.value.name.value;
    const fieldNode = {
      ...info.fieldNodes[0],
      arguments: info.fieldNodes[0].arguments.filter((arg) => arg !== arg_to_remove),
    };
    const variableDefinitions = (info.operation.variableDefinitions || [])
      .filter((def) => def.variable.name.value !== variable_name);
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
    };
  } else if ([Kind.INT, Kind.FLOAT, Kind.STRING, Kind.BOOLEAN, Kind.NULL, Kind.ENUM, Kind.LIST, Kind.OBJECT, Kind.OBJECT_FIELD].includes(arg_to_remove.value.kind)) {
    const fieldNode = {
      ...info.fieldNodes[0],
      arguments: info.fieldNodes[0].arguments.filter((arg) => arg !== arg_to_remove),
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
      },
    };
  } else {
    return info;
  }
}
