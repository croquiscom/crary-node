"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function valueToNode(value, type) {
    if (type instanceof graphql_1.GraphQLNonNull) {
        return valueToNode(value, type.ofType);
    }
    else if (type instanceof graphql_1.GraphQLList) {
        if (!Array.isArray(value)) {
            throw new Error('Value is not array');
        }
        return {
            kind: graphql_1.Kind.LIST,
            values: value.map((item) => valueToNode(item, type.ofType)),
        };
    }
    else {
        let kind;
        if (type === graphql_1.GraphQLInt) {
            kind = graphql_1.Kind.INT;
        }
        else if (type === graphql_1.GraphQLFloat) {
            kind = graphql_1.Kind.FLOAT;
        }
        else if (type === graphql_1.GraphQLBoolean) {
            kind = graphql_1.Kind.BOOLEAN;
        }
        else if (type instanceof graphql_1.GraphQLEnumType) {
            kind = graphql_1.Kind.ENUM;
        }
        else {
            throw new Error('unknow type: ' + type.toString());
        }
        return {
            kind,
            value,
        };
    }
}
function addArgumentToFieldNodeAsValue(fieldNode, path, name, value, type) {
    if (path.length === 0) {
        return Object.assign({}, fieldNode, { arguments: [
                ...(fieldNode.arguments || []),
                {
                    kind: graphql_1.Kind.ARGUMENT,
                    name: {
                        kind: graphql_1.Kind.NAME,
                        value: name,
                    },
                    value: valueToNode(value, type),
                },
            ] });
    }
    if (!fieldNode.selectionSet) {
        return fieldNode;
    }
    const selections = fieldNode.selectionSet.selections.map((selection) => {
        if (selection.kind === 'Field' && selection.name.value === path[0]) {
            return addArgumentToFieldNodeAsValue(selection, path.slice(1), name, value, type);
        }
        return selection;
    });
    return Object.assign({}, fieldNode, { selectionSet: Object.assign({}, fieldNode.selectionSet, { selections }) });
}
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
function addArgumentToFieldNode(fieldNode, path, name, variable_name) {
    if (path.length === 0) {
        return Object.assign({}, fieldNode, { arguments: [
                ...(fieldNode.arguments || []),
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
                            value: variable_name,
                        },
                    },
                },
            ] });
    }
    if (!fieldNode.selectionSet) {
        return fieldNode;
    }
    const selections = fieldNode.selectionSet.selections.map((selection) => {
        if (selection.kind === 'Field' && selection.name.value === path[0]) {
            return addArgumentToFieldNode(selection, path.slice(1), name, variable_name);
        }
        return selection;
    });
    return Object.assign({}, fieldNode, { selectionSet: Object.assign({}, fieldNode.selectionSet, { selections }) });
}
function addArgumentToInfo(info, name, value, type, options = {}) {
    if (options.as_value) {
        const path = options.path ? options.path.split('.') : [];
        const fieldNode = addArgumentToFieldNodeAsValue(info.fieldNodes[0], path, name, value, type);
        return Object.assign({}, info, { fieldNodes: [fieldNode], operation: Object.assign({}, info.operation, { selectionSet: {
                    kind: graphql_1.Kind.SELECTION_SET,
                    selections: [fieldNode],
                } }) });
    }
    else {
        const variable_name = `_c_${name}`;
        const variableDefinitions = [
            ...(info.operation.variableDefinitions || []),
            {
                kind: graphql_1.Kind.VARIABLE_DEFINITION,
                type: typeToAst(type),
                variable: {
                    kind: graphql_1.Kind.VARIABLE,
                    name: {
                        kind: graphql_1.Kind.NAME,
                        value: variable_name,
                    },
                },
            },
        ];
        const path = options.path ? options.path.split('.') : [];
        const fieldNode = addArgumentToFieldNode(info.fieldNodes[0], path, name, variable_name);
        return Object.assign({}, info, { fieldNodes: [fieldNode], operation: Object.assign({}, info.operation, { selectionSet: {
                    kind: graphql_1.Kind.SELECTION_SET,
                    selections: [fieldNode],
                }, variableDefinitions }), variableValues: Object.assign({}, info.variableValues, { [variable_name]: value }) });
    }
}
exports.addArgumentToInfo = addArgumentToInfo;
