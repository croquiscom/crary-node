import { DirectiveNode, GraphQLResolveInfo, SelectionNode } from 'graphql';

function getBooleanArgumentValue(info: GraphQLResolveInfo, node: DirectiveNode): boolean {
  if (!node.arguments || node.arguments.length === 0) {
    return false;
  }
  const argument = node.arguments[0].value;
  switch (argument.kind) {
    case 'BooleanValue':
      return argument.value;
    case 'Variable':
      return info.variableValues[argument.name.value] as boolean;
  }
  return false;
}

export function isExcludedByDirective(info: GraphQLResolveInfo, node: SelectionNode) {
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
