"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conformInfoToSchema = void 0;
const delegate_1 = require("@graphql-tools/delegate");
const graphql_1 = require("graphql");
function conformInfoToSchema(info, schema, field_name) {
    var _a;
    let rootSelectionSet;
    if (field_name) {
        let selections = [];
        let args = [];
        info.fieldNodes.forEach((field) => {
            const fieldSelections = field.selectionSet
                ? field.selectionSet.selections
                : [];
            selections = selections.concat(fieldSelections);
            args = args.concat(field.arguments || []);
        });
        let selectionSet;
        if (selections.length > 0) {
            selectionSet = {
                kind: graphql_1.Kind.SELECTION_SET,
                selections,
            };
        }
        const rootField = {
            kind: graphql_1.Kind.FIELD,
            arguments: args,
            selectionSet,
            name: {
                kind: graphql_1.Kind.NAME,
                value: field_name,
            },
        };
        rootSelectionSet = {
            kind: graphql_1.Kind.SELECTION_SET,
            selections: [rootField],
        };
    }
    else {
        rootSelectionSet = {
            kind: graphql_1.Kind.SELECTION_SET,
            selections: info.fieldNodes,
        };
    }
    const document = {
        kind: graphql_1.Kind.DOCUMENT,
        definitions: [
            {
                kind: graphql_1.Kind.OPERATION_DEFINITION,
                operation: 'query',
                selectionSet: rootSelectionSet,
                variableDefinitions: [],
            },
            ...Object.keys(info.fragments).map((fragmentName) => info.fragments[fragmentName]),
        ],
    };
    const original_request = { document, variables: {} };
    const stitchingInfo = (_a = info === null || info === void 0 ? void 0 : info.schema.extensions) === null || _a === void 0 ? void 0 : _a.stitchingInfo;
    const transforms = [
        new delegate_1.AddSelectionSets({}, stitchingInfo.selectionSetsByField, stitchingInfo.dynamicSelectionSetsByField),
        new delegate_1.FilterToSchema(),
    ];
    const delegation_context = {
        targetSchema: schema,
        info: info,
        returnType: info.returnType,
    };
    const transformed = transforms.reduce((request, transform) => transform.transformRequest(request, delegation_context, {}), original_request);
    const definition = transformed.document.definitions[0];
    return Object.assign(Object.assign({}, info), { fieldNodes: definition.selectionSet.selections });
}
exports.conformInfoToSchema = conformInfoToSchema;
