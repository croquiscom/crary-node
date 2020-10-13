"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conformInfoToSchema = void 0;
const delegate_1 = require("@graphql-tools/delegate");
const graphql_1 = require("graphql");
function conformInfoToSchema(info, schema) {
    var _a;
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
    const request = { document, variables: {} };
    const transformed = new delegate_1.FilterToSchema(schema).transformRequest(new delegate_1.AddFragmentsByField(schema, (_a = info === null || info === void 0 ? void 0 : info.schema.extensions) === null || _a === void 0 ? void 0 : _a.stitchingInfo.fragmentsByField).transformRequest(request));
    const definition = transformed.document.definitions[0];
    return Object.assign(Object.assign({}, info), { fieldNodes: definition.selectionSet.selections });
}
exports.conformInfoToSchema = conformInfoToSchema;
