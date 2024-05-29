"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFieldString = void 0;
const graphql_1 = require("graphql");
const common_1 = require("./common");
function getArgumentStringNode(nodes) {
    const result = nodes.reduce((values, node) => {
        values.push((0, graphql_1.print)(node));
        return values;
    }, []);
    return result.join(', ');
}
function getFieldStringNode(info, nodes) {
    const selections = nodes.reduce((current, source) => {
        if (source.selectionSet) {
            current.push(...source.selectionSet.selections);
        }
        return current;
    }, []);
    const result = selections.reduce((values, node) => {
        if ((0, common_1.isExcludedByDirective)(info, node)) {
            return values;
        }
        switch (node.kind) {
            case 'Field': {
                const name = node.arguments && node.arguments.length > 0
                    ? `${node.name.value}(${getArgumentStringNode(node.arguments)})`
                    : node.name.value;
                if (node.selectionSet && node.selectionSet.selections.length > 0) {
                    values.push(`${name} { ${getFieldStringNode(info, [node])} }`);
                    return values;
                }
                else {
                    values.push(name);
                    return values;
                }
            }
            case 'InlineFragment': {
                const type_name = node.typeCondition.name.value;
                values.push(`... on ${type_name} { ${getFieldStringNode(info, [node])} }`);
                return values;
            }
            case 'FragmentSpread':
                values.push(getFieldStringNode(info, [info.fragments[node.name.value]]));
                return values;
        }
        return [];
    }, []);
    return result.join(' ');
}
function getFieldString(info) {
    return getFieldStringNode(info, info.fieldNodes);
}
exports.getFieldString = getFieldString;
