import { DocumentNode, Kind, parse, OperationDefinitionNode } from 'graphql';

/**
 * GraphQL query에서 operation name이나 첫번째 필드를 반환한다.
 * 로깅시 query를 구분하기 위한 용도로 사용한다.
 *
 * 예)
 * * `query MyOp { some_model { id } another_model {id } }` -> `MyOp`
 * * `{ some_model { id } another_model {id } }` -> `some_model`
 */
export function getOperationNameOrFirstField(query_or_document: string | DocumentNode): string | null {
  const document = typeof query_or_document === 'string' ? parse(query_or_document) : query_or_document;
  if (!document) {
    return null;
  }
  for (const definition of document.definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      if (definition.name) {
        return definition.name.value;
      }
      const selections = definition.selectionSet.selections;
      for (const selection of selections) {
        if (selection.kind === Kind.FIELD) {
          return selection.name.value;
        }
      }
    }
  }
  return null;
}

/**
 * GraphQL query에서 첫번째 필드를 반환한다.
 * 로깅시 query를 구분하기 위한 용도로 사용한다.
 *
 * 예)
 * * `query MyOp { some_model { id } another_model {id } }` -> `some_model`
 * * `{ some_model { id } another_model {id } }` -> `some_model`
 */
export function getFirstField(query_or_document: string | DocumentNode): string | null {
  const document = typeof query_or_document === 'string' ? parse(query_or_document) : query_or_document;
  if (!document) {
    return null;
  }
  for (const definition of document.definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      const selections = definition.selectionSet.selections;
      for (const selection of selections) {
        if (selection.kind === Kind.FIELD) {
          return selection.name.value;
        }
      }
    }
  }
  return null;
}

/**
 * GraphQL query에서 operation name을 반환한다.
 * 로깅시 query를 구분하기 위한 용도로 사용한다.
 *
 * 예)
 * * `query MyOp { some_model { id } another_model {id } }` -> `MyOp`
 * * `{ some_model { id } another_model {id } }` -> null
 */
export function getOperationName(query_or_document: string | DocumentNode): string | null {
  const document = typeof query_or_document === 'string' ? parse(query_or_document) : query_or_document;
  if (!document) {
    return null;
  }
  for (const definition of document.definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      if (definition.name) {
        return definition.name.value;
      }
    }
  }
  return null;
}

/**
 * GraphQL query에서 operation name을 변경한다.
 */
export function replaceOperationName(document: DocumentNode, operation_name: string): DocumentNode {
  if (!document) {
    return document;
  }
  const definitions = document.definitions.map((definition) => {
    if (definition.kind === 'OperationDefinition') {
      return {
        ...definition,
        name: { kind: 'Name', value: operation_name },
      } as OperationDefinitionNode;
    }
    return definition;
  });
  return {
    ...document,
    definitions,
  };
}
