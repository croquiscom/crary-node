import { FieldNode, FragmentDefinitionNode, GraphQLResolveInfo, InlineFragmentNode, SelectionNode } from 'graphql';
import { isExcludedByDirective } from './common';

function dotConcat(a: string, b: string) {
  return a ? `${a}.${b}` : b;
}

function mergeSet<T>(target: Set<T>, source: Set<T>): Set<T> {
  source.forEach(target.add, target);
  return target;
}

function getFieldSetWithPrefix(
  info: GraphQLResolveInfo,
  nodes: ReadonlyArray<FieldNode | InlineFragmentNode | FragmentDefinitionNode>,
  depth: number,
  prefix: string,
): Set<string> {
  const selections = nodes.reduce((current, source) => {
    if (source && source.selectionSet && source.selectionSet.selections) {
      current.push(...source.selectionSet.selections);
    }
    return current;
  }, [] as SelectionNode[]);

  return selections.reduce((set, node) => {
    if (isExcludedByDirective(info, node)) {
      return set;
    }
    switch (node.kind) {
      case 'Field':
        if (depth === 1) {
          return set.add(node.name.value);
        }
        const newPrefix = dotConcat(prefix, node.name.value);
        if (node.selectionSet) {
          return mergeSet(set, getFieldSetWithPrefix(info, [node], depth - 1, newPrefix));
        } else {
          return set.add(newPrefix);
        }
      case 'InlineFragment':
        return mergeSet(set, getFieldSetWithPrefix(info, [node], depth, prefix));
      case 'FragmentSpread':
        return mergeSet(set, getFieldSetWithPrefix(info, [info.fragments[node.name.value]], depth, prefix));
    }
  }, new Set<string>());
}

const getFieldSet = (
  info: GraphQLResolveInfo,
  nodes: ReadonlyArray<FieldNode | InlineFragmentNode | FragmentDefinitionNode>,
  depth: number = 99999,
): Set<string> => getFieldSetWithPrefix(info, nodes, depth, '');

function getSubFieldNode(
  info: GraphQLResolveInfo,
  nodes: ReadonlyArray<FieldNode | InlineFragmentNode | FragmentDefinitionNode>,
  fieldName?: string,
): FieldNode | undefined {
  const selections = nodes.reduce((current, source) => {
    if (source && source.selectionSet && source.selectionSet.selections) {
      current.push(...source.selectionSet.selections);
    }
    return current;
  }, [] as SelectionNode[]);
  for (const node of selections) {
    if (node.kind === 'Field') {
      if (node.name.value === fieldName) {
        return node;
      }
    } else if (node.kind === 'InlineFragment') {
      const result = getSubFieldNode(info, [node], fieldName);
      if (result) {
        return result;
      }
    } else if (node.kind === 'FragmentSpread') {
      const result = getSubFieldNode(info, [info.fragments[node.name.value]], fieldName);
      if (result) {
        return result;
      }
    }
  }
}

export function getFieldList(info: GraphQLResolveInfo, fieldName?: string): string[] {
  if (fieldName) {
    const node = getSubFieldNode(info, info.fieldNodes, fieldName);
    return node ? [...getFieldSet(info, [node])] : [];
  } else {
    return [...getFieldSet(info, info.fieldNodes)];
  }
}

export function getFieldList1st(info: GraphQLResolveInfo, fieldName?: string) {
  if (fieldName) {
    const node = getSubFieldNode(info, info.fieldNodes, fieldName);
    return node ? [...getFieldSet(info, [node], 1)] : [];
  }
  return [...getFieldSet(info, info.fieldNodes, 1)];
}
