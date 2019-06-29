import {
  DirectiveNode, FieldNode, FragmentDefinitionNode,
  GraphQLResolveInfo, InlineFragmentNode, SelectionNode,
} from 'graphql';

function getBooleanArgumentValue(info: GraphQLResolveInfo, node: DirectiveNode): boolean {
  if (!node.arguments || node.arguments.length === 0) {
    return false;
  }
  const argument = node.arguments[0].value;
  switch (argument.kind) {
    case 'BooleanValue':
      return argument.value;
    case 'Variable':
      return info.variableValues[argument.name.value];
  }
  return false;
}

function isExcludedByDirective(info: GraphQLResolveInfo, node: SelectionNode) {
  const directives = node.directives || [];
  let isExcluded = false;
  directives.forEach((directive) => {
    switch (directive.name.value) {
      case 'include':
        isExcluded = isExcluded || !getBooleanArgumentValue(info, directive);
        break;
      case 'skip':
        isExcluded = isExcluded || getBooleanArgumentValue(info, directive);
        break;
    }
  });
  return isExcluded;
}

function dotConcat(a: string, b: string) {
  return a ? `${a}.${b}` : b;
}

function getFieldSet(
  info: GraphQLResolveInfo,
  nodes: ReadonlyArray<FieldNode | InlineFragmentNode | FragmentDefinitionNode>,
  prefix: string,
  depth: number,
): { [path: string]: boolean } {
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
          set[node.name.value] = true;
          return set;
        }
        const newPrefix = dotConcat(prefix, node.name.value);
        if (node.selectionSet) {
          return Object.assign({}, set, getFieldSet(info, [node], newPrefix, depth - 1));
        } else {
          set[newPrefix] = true;
          return set;
        }
      case 'InlineFragment':
        return Object.assign({}, set, getFieldSet(info, [node], prefix, depth));
      case 'FragmentSpread':
        return Object.assign({}, set, getFieldSet(info, [info.fragments[node.name.value]], prefix, depth));
    }
  }, {} as { [path: string]: boolean });
}

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
    if (node) {
      return Object.keys(getFieldSet(info, [node], '', 99999));
    }
    return [];
  } else {
    return Object.keys(getFieldSet(info, info.fieldNodes, '', 99999));
  }
}

export function getFieldList1st(info: GraphQLResolveInfo, fieldName?: string) {
  if (fieldName) {
    const node = getSubFieldNode(info, info.fieldNodes, fieldName);
    return node ? Object.keys(getFieldSet(info, [node], '', 1)) : [];
  }
  return Object.keys(getFieldSet(info, info.fieldNodes, '', 1));
}
