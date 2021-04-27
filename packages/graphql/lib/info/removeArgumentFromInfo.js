"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeArgumentFromInfo = void 0;
const graphql_1 = require("graphql");
function removeArgumentFromInfo(info, name) {
    if (!info.fieldNodes[0].arguments) {
        return info;
    }
    const arg_to_remove = info.fieldNodes[0].arguments.find((arg) => {
        return arg.name.value === name;
    });
    if (!arg_to_remove) {
        return info;
    }
    if (arg_to_remove.value.kind === graphql_1.Kind.VARIABLE) {
        const variable_name = arg_to_remove.value.name.value;
        const fieldNode = Object.assign(Object.assign({}, info.fieldNodes[0]), { arguments: info.fieldNodes[0].arguments.filter((arg) => arg !== arg_to_remove) });
        const variableDefinitions = (info.operation.variableDefinitions || []).filter((def) => def.variable.name.value !== variable_name);
        return Object.assign(Object.assign({}, info), { fieldNodes: [fieldNode], operation: Object.assign(Object.assign({}, info.operation), { selectionSet: {
                    kind: graphql_1.Kind.SELECTION_SET,
                    selections: [fieldNode],
                }, variableDefinitions }) });
    }
    else if ([
        graphql_1.Kind.INT,
        graphql_1.Kind.FLOAT,
        graphql_1.Kind.STRING,
        graphql_1.Kind.BOOLEAN,
        graphql_1.Kind.NULL,
        graphql_1.Kind.ENUM,
        graphql_1.Kind.LIST,
        graphql_1.Kind.OBJECT,
        graphql_1.Kind.OBJECT_FIELD,
    ].includes(arg_to_remove.value.kind)) {
        const fieldNode = Object.assign(Object.assign({}, info.fieldNodes[0]), { arguments: info.fieldNodes[0].arguments.filter((arg) => arg !== arg_to_remove) });
        return Object.assign(Object.assign({}, info), { fieldNodes: [fieldNode], operation: Object.assign(Object.assign({}, info.operation), { selectionSet: {
                    kind: graphql_1.Kind.SELECTION_SET,
                    selections: [fieldNode],
                } }) });
    }
    else {
        return info;
    }
}
exports.removeArgumentFromInfo = removeArgumentFromInfo;
