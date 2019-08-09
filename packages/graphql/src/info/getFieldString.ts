import {
  ArgumentNode, FieldNode, FragmentDefinitionNode,
  GraphQLResolveInfo, InlineFragmentNode, print, SelectionNode,
} from 'graphql';
import { isExcludedByDirective } from './common';

function getArgumentStringNode(nodes: readonly ArgumentNode[]): string {
  const result = nodes.reduce((values: string[], node: any) => {
    values.push(print(node));
    return values;
  }, []);

  return result.join(', ');
}

function getFieldStringNode(
  info: GraphQLResolveInfo,
  nodes: ReadonlyArray<FieldNode | InlineFragmentNode | FragmentDefinitionNode>,
): string {
  const selections = nodes.reduce((current, source) => {
    if (source && source.selectionSet && source.selectionSet.selections) {
      current.push(...source.selectionSet.selections);
    }
    return current;
  }, [] as SelectionNode[]);

  const result = selections.reduce((values, node) => {
    if (isExcludedByDirective(info, node)) {
      return values;
    }
    switch (node.kind) {
      case 'Field':
        const name = (node.arguments && node.arguments.length > 0) ?
          `${node.name.value}(${getArgumentStringNode(node.arguments)})`
          :
          node.name.value;
        if (node.selectionSet) {
          values.push(`${name} { ${getFieldStringNode(info, [node])} }`);
          return values;
        } else {
          values.push(name);
          return values;
        }
      case 'InlineFragment':
        const type_name = (node as InlineFragmentNode).typeCondition!.name.value;
        values.push(`... on ${type_name} { ${getFieldStringNode(info, [node])} }`);
        return values;
      case 'FragmentSpread':
        values.push(getFieldStringNode(info, [info.fragments[node.name.value]]));
        return values;
    }
  }, [] as string[]);

  return result.join(' ');
}

export function getFieldString(info: GraphQLResolveInfo) {
  return getFieldStringNode(info, info.fieldNodes);
}
