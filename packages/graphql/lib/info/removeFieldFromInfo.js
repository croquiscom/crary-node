"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFieldFromInfo = void 0;
const graphql_1 = require("graphql");
function removeFieldFromFieldNode(fieldNode, path, name) {
    if (!fieldNode.selectionSet) {
        return fieldNode;
    }
    if (path.length === 0) {
        return Object.assign(Object.assign({}, fieldNode), { selectionSet: Object.assign(Object.assign({}, fieldNode.selectionSet), { selections: fieldNode.selectionSet.selections.filter((selection) => {
                    return !(selection.kind === 'Field' && selection.name.value === name);
                }) }) });
    }
    else {
        const selections = fieldNode.selectionSet.selections.map((selection) => {
            if (selection.kind === 'Field' && selection.name.value === path[0]) {
                return removeFieldFromFieldNode(selection, path.slice(1), name);
            }
            return selection;
        });
        return Object.assign(Object.assign({}, fieldNode), { selectionSet: Object.assign(Object.assign({}, fieldNode.selectionSet), { selections }) });
    }
}
function removeFieldFromInfo(info, name, options = {}) {
    const path = options.path ? options.path.split('.') : [];
    const fieldNode = removeFieldFromFieldNode(info.fieldNodes[0], path, name);
    return Object.assign(Object.assign({}, info), { fieldNodes: [fieldNode], operation: Object.assign(Object.assign({}, info.operation), { selectionSet: {
                kind: graphql_1.Kind.SELECTION_SET,
                selections: [fieldNode],
            } }) });
}
exports.removeFieldFromInfo = removeFieldFromInfo;
