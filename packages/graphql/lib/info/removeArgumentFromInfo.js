"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    if (arg_to_remove.value.kind !== graphql_1.Kind.VARIABLE) {
        return info;
    }
    const variable_name = arg_to_remove.value.name.value;
    const fieldNode = Object.assign(Object.assign({}, info.fieldNodes[0]), { arguments: info.fieldNodes[0].arguments.filter((arg) => arg !== arg_to_remove) });
    const variableDefinitions = (info.operation.variableDefinitions || [])
        .filter((def) => def.variable.name.value !== variable_name);
    return Object.assign(Object.assign({}, info), { fieldNodes: [fieldNode], operation: Object.assign(Object.assign({}, info.operation), { selectionSet: {
                kind: graphql_1.Kind.SELECTION_SET,
                selections: [fieldNode],
            }, variableDefinitions }) });
}
exports.removeArgumentFromInfo = removeArgumentFromInfo;
