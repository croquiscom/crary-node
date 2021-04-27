import { FieldNode, FragmentDefinitionNode, GraphQLResolveInfo, Kind } from 'graphql';

export interface IRemoveFieldFromInfoOptions {
  path?: string;
}

type Fragments = { [key: string]: FragmentDefinitionNode };

function removeFieldFromFragment(fragment: FragmentDefinitionNode, name: string): FragmentDefinitionNode {
  return {
    ...fragment,
    selectionSet: {
      ...fragment.selectionSet,
      selections: fragment.selectionSet.selections.filter((s) => {
        return !(s.kind === 'Field' && s.name.value === name);
      }),
    },
  };
}

function removeFieldFromFieldNode(fieldNode: FieldNode, path: string[], name: string, fragments: Fragments): [FieldNode, Fragments] {
  if (!fieldNode.selectionSet) {
    return [fieldNode, fragments];
  }

  if (path.length === 0) {
    const new_fragments = { ...fragments };
    for (const selection of fieldNode.selectionSet.selections) {
      if (selection.kind === 'FragmentSpread') {
        new_fragments[selection.name.value] = removeFieldFromFragment(new_fragments[selection.name.value], name);
      }
    }
    const new_field_node = {
      ...fieldNode,
      selectionSet: {
        ...fieldNode.selectionSet,
        selections: fieldNode.selectionSet.selections.filter((selection) => {
          return !(selection.kind === 'Field' && selection.name.value === name);
        }),
      },
    };
    return [new_field_node, new_fragments];
  } else {
    let new_fragments = fragments;
    const selections = fieldNode.selectionSet.selections.map((selection) => {
      if (selection.kind === 'Field' && selection.name.value === path[0]) {
        let new_selection;
        [new_selection, new_fragments] = removeFieldFromFieldNode(selection, path.slice(1), name, new_fragments);
        return new_selection;
      }
      return selection;
    });
    const new_field_node: FieldNode = {
      ...fieldNode,
      selectionSet: {
        ...fieldNode.selectionSet,
        selections,
      },
    };
    return [new_field_node, new_fragments];
  }
}

export function removeFieldFromInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(
  info: T, name: string, options: IRemoveFieldFromInfoOptions = {},
): T {
  const path = options.path ? options.path.split('.') : [];
  const [new_field_node, new_fragments] = removeFieldFromFieldNode(info.fieldNodes[0], path, name, info.fragments);
  return {
    ...info,
    fragments: new_fragments,
    fieldNodes: [new_field_node],
    operation: {
      ...info.operation,
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [new_field_node],
      },
    },
  };
}
