"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
function dotConcat(a, b) {
    return a ? `${a}.${b}` : b;
}
function mergeSet(target, source) {
    source.forEach(target.add, target);
    return target;
}
function getFieldSetWithPrefix(info, nodes, depth, prefix) {
    const selections = nodes.reduce((current, source) => {
        if (source && source.selectionSet && source.selectionSet.selections) {
            current.push(...source.selectionSet.selections);
        }
        return current;
    }, []);
    return selections.reduce((set, node) => {
        if (common_1.isExcludedByDirective(info, node)) {
            return set;
        }
        switch (node.kind) {
            case 'Field':
                if (depth === 1) {
                    return set.add(node.name.value);
                }
                const newPrefix = dotConcat(prefix, node.name.value);
                if (node.selectionSet) {
                    return mergeSet(set, getFieldSetWithPrefix(info, [node], depth - 1, newPrefix));
                }
                else {
                    return set.add(newPrefix);
                }
            case 'InlineFragment':
                return mergeSet(set, getFieldSetWithPrefix(info, [node], depth, prefix));
            case 'FragmentSpread':
                return mergeSet(set, getFieldSetWithPrefix(info, [info.fragments[node.name.value]], depth, prefix));
        }
    }, new Set());
}
const getFieldSet = (info, nodes, depth = 99999) => getFieldSetWithPrefix(info, nodes, depth, '');
function getSubFieldNode(info, nodes, fieldName) {
    const selections = nodes.reduce((current, source) => {
        if (source && source.selectionSet && source.selectionSet.selections) {
            current.push(...source.selectionSet.selections);
        }
        return current;
    }, []);
    for (const node of selections) {
        if (node.kind === 'Field') {
            if (node.name.value === fieldName) {
                return node;
            }
        }
        else if (node.kind === 'InlineFragment') {
            const result = getSubFieldNode(info, [node], fieldName);
            if (result) {
                return result;
            }
        }
        else if (node.kind === 'FragmentSpread') {
            const result = getSubFieldNode(info, [info.fragments[node.name.value]], fieldName);
            if (result) {
                return result;
            }
        }
    }
}
function getFieldList(info, fieldName) {
    if (fieldName) {
        const node = getSubFieldNode(info, info.fieldNodes, fieldName);
        return node ? [...getFieldSet(info, [node])] : [];
    }
    else {
        return [...getFieldSet(info, info.fieldNodes)];
    }
}
exports.getFieldList = getFieldList;
function getFieldList1st(info, fieldName) {
    if (fieldName) {
        const node = getSubFieldNode(info, info.fieldNodes, fieldName);
        return node ? [...getFieldSet(info, [node], 1)] : [];
    }
    return [...getFieldSet(info, info.fieldNodes, 1)];
}
exports.getFieldList1st = getFieldList1st;
