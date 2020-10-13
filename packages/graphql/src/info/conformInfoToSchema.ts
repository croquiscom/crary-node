import { FilterToSchema, AddFragmentsByField } from '@graphql-tools/delegate';
import { Request } from '@graphql-tools/utils';
import { ArgumentNode, DocumentNode, FieldNode, GraphQLResolveInfo, GraphQLSchema, Kind, OperationDefinitionNode, SelectionNode, SelectionSetNode } from 'graphql';

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
      const fieldSelections = field.selectionSet
        ? field.selectionSet.selections
        : [];
      selections = selections.concat(fieldSelections);
      args = args.concat(field.arguments || []);
    });

    let selectionSet;
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
        operation: 'query',
        selectionSet: rootSelectionSet,
        variableDefinitions: [],
      },
      ...Object.keys(info.fragments).map(
        (fragmentName) => info.fragments[fragmentName],
      ),
    ],
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
