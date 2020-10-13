import { FilterToSchema, AddFragmentsByField } from '@graphql-tools/delegate';
import { Request } from '@graphql-tools/utils';
import { DocumentNode, FieldNode, GraphQLResolveInfo, GraphQLSchema, Kind, OperationDefinitionNode } from 'graphql';

export function conformInfoToSchema<T extends GraphQLResolveInfo = GraphQLResolveInfo>(
  info: T,
  schema: GraphQLSchema,
): T {
  const document: DocumentNode = {
    definitions: [
      {
        kind: Kind.OPERATION_DEFINITION,
        operation: 'query',
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: info.fieldNodes,
        },
        variableDefinitions: [],
      },
    ],
    kind: Kind.DOCUMENT,
  };
  const request: Request = { document, variables: {} };
  const transformed = new FilterToSchema(schema).transformRequest(
    new AddFragmentsByField(schema, info?.schema.extensions?.stitchingInfo.fragmentsByField).transformRequest(request),
  );
  const definition = transformed.document.definitions[0] as OperationDefinitionNode;
  return {
    ...info,
    fieldNodes: definition.selectionSet.selections as FieldNode[],
  };
}
