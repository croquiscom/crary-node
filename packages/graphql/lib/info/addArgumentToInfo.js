"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function typeToAst(type) {
    if (type instanceof graphql_1.GraphQLNonNull) {
        const innerType = typeToAst(type.ofType);
        if (innerType.kind === graphql_1.Kind.LIST_TYPE ||
            innerType.kind === graphql_1.Kind.NAMED_TYPE) {
            return {
                kind: graphql_1.Kind.NON_NULL_TYPE,
                type: innerType,
            };
        }
        else {
            throw new Error('Incorrect inner non-null type');
        }
    }
    else if (type instanceof graphql_1.GraphQLList) {
        return {
            kind: graphql_1.Kind.LIST_TYPE,
            type: typeToAst(type.ofType),
        };
    }
    else {
        return {
            kind: graphql_1.Kind.NAMED_TYPE,
            name: {
                kind: graphql_1.Kind.NAME,
                value: type.toString(),
            },
        };
    }
}
function addArgumentToInfo(info, name, value, type) {
    const varaiable_name = `_c_${name}`;
    const variableDefinitions = [
        ...(info.operation.variableDefinitions || []),
        {
            kind: graphql_1.Kind.VARIABLE_DEFINITION,
            type: typeToAst(type),
            variable: {
                kind: graphql_1.Kind.VARIABLE,
                name: {
                    kind: graphql_1.Kind.NAME,
                    value: varaiable_name,
                },
            },
        },
    ];
    const fieldNode = Object.assign({}, info.fieldNodes[0], { arguments: [
            ...(info.fieldNodes[0].arguments || []),
            {
                kind: graphql_1.Kind.ARGUMENT,
                name: {
                    kind: graphql_1.Kind.NAME,
                    value: name,
                },
                value: {
                    kind: graphql_1.Kind.VARIABLE,
                    name: {
                        kind: graphql_1.Kind.NAME,
                        value: varaiable_name,
                    },
                },
            },
        ] });
    return Object.assign({}, info, { fieldNodes: [fieldNode], operation: Object.assign({}, info.operation, { selectionSet: {
                kind: graphql_1.Kind.SELECTION_SET,
                selections: [fieldNode],
            }, variableDefinitions }), variableValues: Object.assign({}, info.variableValues, { [varaiable_name]: value }) });
}
exports.addArgumentToInfo = addArgumentToInfo;
