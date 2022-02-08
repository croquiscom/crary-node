import { DelegationContext, Transformer as DelegateTransformer } from '@graphql-tools/delegate';
import { ExecutionRequest } from '@graphql-tools/utils';
import {
  ArgumentNode,
  DocumentNode,
  FieldNode,
  GraphQLResolveInfo,
  GraphQLSchema,
  Kind,
  OperationDefinitionNode,
  OperationTypeNode,
  SelectionNode,
  SelectionSetNode,
} from 'graphql';

export function conformInfoToSchema<T extends GraphQLResolveInfo = GraphQLResolveInfo>(
  info: T,
  schema: GraphQLSchema,
  field_name?: string,
): T {
  let rootSelectionSet: SelectionSetNode;
  if (field_name) {
    let selections: SelectionNode[] = [];
    let args: ArgumentNode[] = [];

    info.fieldNodes.forEach((field: FieldNode) => {
      const fieldSelections = field.selectionSet ? field.selectionSet.selections : [];
      selections = selections.concat(fieldSelections);
      args = args.concat(field.arguments || []);
    });

    let selectionSet: SelectionSetNode | undefined;
    if (selections.length > 0) {
      selectionSet = {
        kind: Kind.SELECTION_SET,
        selections,
      };
    }

    const rootField: FieldNode = {
      kind: Kind.FIELD,
      arguments: args,
      selectionSet,
      name: {
        kind: Kind.NAME,
        value: field_name,
      },
    };

    rootSelectionSet = {
      kind: Kind.SELECTION_SET,
      selections: [rootField],
    };
  } else {
    rootSelectionSet = {
      kind: Kind.SELECTION_SET,
      selections: info.fieldNodes,
    };
  }

  const document: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [
      {
        kind: Kind.OPERATION_DEFINITION,
        operation: OperationTypeNode.QUERY,
        selectionSet: rootSelectionSet,
        variableDefinitions: [],
      },
      ...Object.keys(info.fragments).map((fragmentName) => info.fragments[fragmentName]),
    ],
  };
  const original_request: ExecutionRequest = { document, operationType: OperationTypeNode.QUERY, variables: {} };
  const delegation_context = {
    targetSchema: schema,
    info: info as GraphQLResolveInfo,
    returnType: info.returnType,
    transforms: [],
    transformedSchema: schema,
  } as unknown as DelegationContext;
  const transformer = new DelegateTransformer(delegation_context);
  const transformed = transformer.transformRequest(original_request);
  const definition = transformed.document.definitions[0] as OperationDefinitionNode;
  return {
    ...info,
    fieldNodes: definition.selectionSet.selections as FieldNode[],
  };
}
