import { FieldNode, GraphQLResolveInfo, Kind } from 'graphql';

export interface IRemoveFieldFromInfoOptions {
  path?: string;
}

function removeFieldFromFieldNode(fieldNode: FieldNode, path: string[], name: string): FieldNode {
  if (!fieldNode.selectionSet) {
    return fieldNode;
  }

  if (path.length === 0) {
    return {
      ...fieldNode,
      selectionSet: {
        ...fieldNode.selectionSet,
        selections: fieldNode.selectionSet.selections.filter((selection) => {
          return !(selection.kind === 'Field' && selection.name.value === name);
        }),
      },
    };
  } else {
    const selections = fieldNode.selectionSet.selections.map((selection) => {
      if (selection.kind === 'Field' && selection.name.value === path[0]) {
        return removeFieldFromFieldNode(selection, path.slice(1), name);
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
}

export function removeFieldFromInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(
  info: T, name: string, options: IRemoveFieldFromInfoOptions = {},
): T {
  const path = options.path ? options.path.split('.') : [];
  const fieldNode = removeFieldFromFieldNode(info.fieldNodes[0], path, name);
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
}
