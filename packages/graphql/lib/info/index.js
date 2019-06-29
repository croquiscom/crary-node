"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBooleanArgumentValue(info, node) {
    const argument = node.arguments[0].value;
    switch (argument.kind) {
        case 'BooleanValue':
            return argument.value;
        case 'Variable':
            return info.variableValues[argument.name.value];
    }
}
function isExcludedByDirective(info, node) {
    const directives = node.directives || [];
    let isExcluded = false;
    directives.forEach((directive) => {
        switch (directive.name.value) {
            case 'include':
                isExcluded = isExcluded || !getBooleanArgumentValue(info, directive);
                break;
            case 'skip':
                isExcluded = isExcluded || getBooleanArgumentValue(info, directive);
                break;
        }
    });
    return isExcluded;
}
function dotConcat(a, b) {
    return a ? `${a}.${b}` : b;
}
function getFieldSet(info, nodes, prefix, depth) {
    if (!Array.isArray(nodes)) {
        nodes = [nodes];
    }
    const selections = nodes.reduce((current, source) => {
        if (source && source.selectionSet && source.selectionSet.selections) {
            current.push(...source.selectionSet.selections);
        }
        return current;
    }, []);
    return selections.reduce((set, node) => {
        if (isExcludedByDirective(info, node)) {
            return set;
        }
        switch (node.kind) {
            case 'Field':
                if (depth === 1) {
                    set[node.name.value] = true;
                    return set;
                }
                const newPrefix = dotConcat(prefix, node.name.value);
                if (node.selectionSet) {
                    return Object.assign({}, set, getFieldSet(info, node, newPrefix, depth - 1));
                }
                else {
                    set[newPrefix] = true;
                    return set;
                }
            case 'InlineFragment':
                return Object.assign({}, set, getFieldSet(info, node, prefix, depth));
            case 'FragmentSpread':
                return Object.assign({}, set, getFieldSet(info, info.fragments[node.name.value], prefix, depth));
        }
    }, {});
}
function getSubFieldNode(info, nodes, fieldName) {
    if (!Array.isArray(nodes)) {
        nodes = [nodes];
    }
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
            const result = getSubFieldNode(info, node, fieldName);
            if (result) {
                return result;
            }
        }
        else if (node.kind === 'FragmentSpread') {
            const result = getSubFieldNode(info, info.fragments[node.name.value], fieldName);
            if (result) {
                return result;
            }
        }
    }
}
function getFieldList(info, fieldName) {
    if (fieldName) {
        const node = getSubFieldNode(info, info.fieldNodes, fieldName);
        if (node) {
            return Object.keys(getFieldSet(info, node, '', 99999));
        }
        return [];
    }
    else {
        return Object.keys(getFieldSet(info, info.fieldNodes, '', 99999));
    }
}
exports.getFieldList = getFieldList;
function getFieldList1st(info, fieldName) {
    if (fieldName) {
        const node = getSubFieldNode(info, info.fieldNodes, fieldName);
        return node ? Object.keys(getFieldSet(info, node, '', 1)) : [];
    }
    return Object.keys(getFieldSet(info, info.fieldNodes, '', 1));
}
exports.getFieldList1st = getFieldList1st;
