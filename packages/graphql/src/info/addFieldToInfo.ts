import { FieldNode, GraphQLResolveInfo, Kind } from 'graphql';

export interface IAddFieldToInfoOptions {
  path?: string;
}

function addFieldToFieldNode(fieldNode: FieldNode, path: string[], name: string): FieldNode {
  if (!fieldNode.selectionSet) {
    return fieldNode;
  }

  if (path.length === 0) {
    const exist = fieldNode.selectionSet.selections.some((selection) => {
      return selection.kind === 'Field' && selection.name.value === name;
    });
    if (exist) {
      return fieldNode;
    }
    const new_selection: FieldNode = {
      kind: Kind.FIELD,
      name: {
        kind: Kind.NAME,
        value: name,
      },
    };
    const selections = [...fieldNode.selectionSet.selections, new_selection];
    return {
      ...fieldNode,
      selectionSet: {
        ...fieldNode.selectionSet,
        selections,
      },
    };
  } else {
    const selections = fieldNode.selectionSet.selections.map((selection) => {
      if (selection.kind === 'Field' && selection.name.value === path[0]) {
        return addFieldToFieldNode(selection, path.slice(1), name);
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

export function addFieldToInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(
  info: T,
  name: string,
  options: IAddFieldToInfoOptions = {},
): T {
  const path = options.path ? options.path.split('.') : [];
  const fieldNode = addFieldToFieldNode(info.fieldNodes[0], path, name);
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
