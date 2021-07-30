import { DocumentNode } from 'graphql';
/**
 * GraphQL query에서 operation name이나 첫번째 필드를 반환한다.
 * 로깅시 query를 구분하기 위한 용도로 사용한다.
 *
 * 예)
 * * `query MyOp { some_model { id } another_model {id } }` -> `MyOp`
 * * `{ some_model { id } another_model {id } }` -> `some_model`
 */
export declare function getOperationNameOrFirstField(query_or_document: string | DocumentNode): string | null;
/**
 * GraphQL query에서 첫번째 필드를 반환한다.
 * 로깅시 query를 구분하기 위한 용도로 사용한다.
 *
 * 예)
 * * `query MyOp { some_model { id } another_model {id } }` -> `some_model`
 * * `{ some_model { id } another_model {id } }` -> `some_model`
 */
export declare function getFirstField(query_or_document: string | DocumentNode): string | null;
/**
 * GraphQL query에서 operation name을 반환한다.
 * 로깅시 query를 구분하기 위한 용도로 사용한다.
 *
 * 예)
 * * `query MyOp { some_model { id } another_model {id } }` -> `MyOp`
 * * `{ some_model { id } another_model {id } }` -> null
 */
export declare function getOperationName(query_or_document: string | DocumentNode): string | null;
/**
 * GraphQL query에서 operation name을 변경한다.
 */
export declare function replaceOperationName(document: DocumentNode, operation_name: string): DocumentNode;
