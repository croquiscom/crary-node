import type { DirectiveNode, GraphQLInputType, GraphQLResolveInfo, SelectionNode } from 'graphql';
import { versionInfo } from 'graphql';

/**
 * graphql 17부터 info.variableValues가 { sources, coerced } 구조로 바뀌었다.
 */
const IS_VARIABLE_VALUES_STRUCTURED = versionInfo.major >= 17;

type ObjMap = Record<string, unknown>;

interface StructuredVariableValues {
  sources: Record<string, { signature: { name: string; type: GraphQLInputType; default: undefined }; value?: unknown }>;
  coerced: ObjMap;
}

export function getVariableValues(info: GraphQLResolveInfo): ObjMap {
  const variableValues = info.variableValues as unknown;
  if (IS_VARIABLE_VALUES_STRUCTURED) {
    return (variableValues as StructuredVariableValues).coerced;
  }
  return variableValues as ObjMap;
}

export function addVariableValue(
  info: GraphQLResolveInfo,
  name: string,
  value: unknown,
  type: GraphQLInputType,
): GraphQLResolveInfo['variableValues'] {
  const variableValues = info.variableValues as unknown;
  if (IS_VARIABLE_VALUES_STRUCTURED) {
    const { sources, coerced } = variableValues as StructuredVariableValues;
    const structured: StructuredVariableValues = {
      sources: { ...sources, [name]: { signature: { name, type, default: undefined }, value } },
      coerced: { ...coerced, [name]: value },
    };
    return structured as unknown as GraphQLResolveInfo['variableValues'];
  }
  return { ...(variableValues as ObjMap), [name]: value } as unknown as GraphQLResolveInfo['variableValues'];
}

function getBooleanArgumentValue(info: GraphQLResolveInfo, node: DirectiveNode): boolean {
  if (!node.arguments || node.arguments.length === 0) {
    return false;
  }
  const argument = node.arguments[0].value;
  switch (argument.kind) {
    case 'BooleanValue':
      return argument.value;
    case 'Variable':
      return getVariableValues(info)[argument.name.value] as boolean;
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
