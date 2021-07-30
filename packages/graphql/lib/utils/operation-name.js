"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceOperationName = exports.getOperationName = exports.getFirstField = exports.getOperationNameOrFirstField = void 0;
const graphql_1 = require("graphql");
/**
 * GraphQL query에서 operation name이나 첫번째 필드를 반환한다.
 * 로깅시 query를 구분하기 위한 용도로 사용한다.
 *
 * 예)
 * * `query MyOp { some_model { id } another_model {id } }` -> `MyOp`
 * * `{ some_model { id } another_model {id } }` -> `some_model`
 */
function getOperationNameOrFirstField(query_or_document) {
    const document = typeof query_or_document === 'string' ? graphql_1.parse(query_or_document) : query_or_document;
    if (!document) {
        return null;
    }
    for (const definition of document.definitions) {
        if (definition.kind === graphql_1.Kind.OPERATION_DEFINITION) {
            if (definition.name) {
                return definition.name.value;
            }
            const selections = definition.selectionSet.selections;
            for (const selection of selections) {
                if (selection.kind === graphql_1.Kind.FIELD) {
                    return selection.name.value;
                }
            }
        }
    }
    return null;
}
exports.getOperationNameOrFirstField = getOperationNameOrFirstField;
/**
 * GraphQL query에서 첫번째 필드를 반환한다.
 * 로깅시 query를 구분하기 위한 용도로 사용한다.
 *
 * 예)
 * * `query MyOp { some_model { id } another_model {id } }` -> `some_model`
 * * `{ some_model { id } another_model {id } }` -> `some_model`
 */
function getFirstField(query_or_document) {
    const document = typeof query_or_document === 'string' ? graphql_1.parse(query_or_document) : query_or_document;
    if (!document) {
        return null;
    }
    for (const definition of document.definitions) {
        if (definition.kind === graphql_1.Kind.OPERATION_DEFINITION) {
            const selections = definition.selectionSet.selections;
            for (const selection of selections) {
                if (selection.kind === graphql_1.Kind.FIELD) {
                    return selection.name.value;
                }
            }
        }
    }
    return null;
}
exports.getFirstField = getFirstField;
/**
 * GraphQL query에서 operation name을 반환한다.
 * 로깅시 query를 구분하기 위한 용도로 사용한다.
 *
 * 예)
 * * `query MyOp { some_model { id } another_model {id } }` -> `MyOp`
 * * `{ some_model { id } another_model {id } }` -> null
 */
function getOperationName(query_or_document) {
    const document = typeof query_or_document === 'string' ? graphql_1.parse(query_or_document) : query_or_document;
    if (!document) {
        return null;
    }
    for (const definition of document.definitions) {
        if (definition.kind === graphql_1.Kind.OPERATION_DEFINITION) {
            if (definition.name) {
                return definition.name.value;
            }
        }
    }
    return null;
}
exports.getOperationName = getOperationName;
/**
 * GraphQL query에서 operation name을 변경한다.
 */
function replaceOperationName(document, operation_name) {
    if (!document) {
        return document;
    }
    const definitions = document.definitions.map((definition) => {
        if (definition.kind === 'OperationDefinition') {
            return Object.assign(Object.assign({}, definition), { name: { kind: 'Name', value: operation_name } });
        }
        return definition;
    });
    return Object.assign(Object.assign({}, document), { definitions });
}
exports.replaceOperationName = replaceOperationName;
