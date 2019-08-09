"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function addFieldToFieldNode(fieldNode, path, name) {
    if (!fieldNode.selectionSet) {
        return fieldNode;
    }
    if (path.length === 0) {
        const exist = fieldNode.selectionSet.selections.some((selection) => {
            return selection.kind === 'Field' && selection.name.value === name;
        });
        if (exist) {
            return fieldNode;
        }
        const new_selection = {
            kind: 'Field',
            name: {
                kind: 'Name',
                value: name,
            },
        };
        const selections = [...fieldNode.selectionSet.selections, new_selection];
        return Object.assign({}, fieldNode, { selectionSet: Object.assign({}, fieldNode.selectionSet, { selections }) });
    }
    else {
        const selections = fieldNode.selectionSet.selections.map((selection) => {
            if (selection.kind === 'Field' && selection.name.value === path[0]) {
                return addFieldToFieldNode(selection, path.slice(1), name);
            }
            return selection;
        });
        return Object.assign({}, fieldNode, { selectionSet: Object.assign({}, fieldNode.selectionSet, { selections }) });
    }
}
function addFieldToInfo(info, name, path) {
    const fieldNode = addFieldToFieldNode(info.fieldNodes[0], path ? path.split('.') : [], name);
    return Object.assign({}, info, { fieldNodes: [fieldNode], operation: Object.assign({}, info.operation, { selectionSet: {
                kind: graphql_1.Kind.SELECTION_SET,
                selections: [fieldNode],
            } }) });
}
exports.addFieldToInfo = addFieldToInfo;
