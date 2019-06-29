"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
function getArgumentStringNode(nodes) {
    const result = nodes.reduce((values, node) => {
        switch (node.value.kind) {
            case 'Variable':
                values.push(`${node.name.value}: $${node.value.name.value}`);
                return values;
            case 'StringValue':
                values.push(`${node.name.value}: "${node.value.value}"`);
                return values;
            case 'ObjectValue':
                values.push(`${node.name.value}: { ${getArgumentStringNode(node.value.fields)} }`);
                return values;
            default:
                values.push(`${node.name.value}: ${node.value.value}`);
                return values;
        }
    }, []);
    return result.join(', ');
}
function getFieldStringNode(info, nodes) {
    const selections = nodes.reduce((current, source) => {
        if (source && source.selectionSet && source.selectionSet.selections) {
            current.push(...source.selectionSet.selections);
        }
        return current;
    }, []);
    const result = selections.reduce((values, node) => {
        if (common_1.isExcludedByDirective(info, node)) {
            return values;
        }
        switch (node.kind) {
            case 'Field':
                const name = (node.arguments && node.arguments.length > 0) ?
                    `${node.name.value}(${getArgumentStringNode(node.arguments)})`
                    :
                        node.name.value;
                if (node.selectionSet) {
                    values.push(`${name} { ${getFieldStringNode(info, [node])} }`);
                    return values;
                }
                else {
                    values.push(name);
                    return values;
                }
            case 'InlineFragment':
                const type_name = node.typeCondition.name.value;
                values.push(`... on ${type_name} { ${getFieldStringNode(info, [node])} }`);
                return values;
            case 'FragmentSpread':
                values.push(getFieldStringNode(info, [info.fragments[node.name.value]]));
                return values;
        }
    }, []);
    return result.join(' ');
}
function getFieldString(info) {
    return getFieldStringNode(info, info.fieldNodes);
}
exports.getFieldString = getFieldString;
