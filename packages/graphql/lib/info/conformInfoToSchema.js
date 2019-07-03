"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_tools_1 = require("graphql-tools");
function conformInfoToSchema(info, schema, fragments) {
    const document = {
        definitions: [
            {
                kind: graphql_1.Kind.OPERATION_DEFINITION,
                operation: 'query',
                selectionSet: {
                    kind: graphql_1.Kind.SELECTION_SET,
                    selections: info.fieldNodes,
                },
                variableDefinitions: [],
            },
        ],
        kind: graphql_1.Kind.DOCUMENT,
    };
    if (!fragments) {
        if (info.mergeInfo) {
            fragments = info.mergeInfo.fragments;
        }
        else {
            fragments = [];
        }
    }
    const request = { document, variables: {} };
    const transformed = new graphql_tools_1.FilterToSchema(schema).transformRequest(new graphql_tools_1.ReplaceFieldWithFragment(schema, fragments).transformRequest(request));
    const definition = transformed.document.definitions[0];
    return Object.assign({}, info, { fieldNodes: definition.selectionSet.selections });
}
exports.conformInfoToSchema = conformInfoToSchema;
