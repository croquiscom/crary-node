"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariableValues = getVariableValues;
exports.addVariableValue = addVariableValue;
exports.isExcludedByDirective = isExcludedByDirective;
const graphql_1 = require("graphql");
/**
 * graphql 17부터 info.variableValues가 { sources, coerced } 구조로 바뀌었다.
 */
const IS_VARIABLE_VALUES_STRUCTURED = graphql_1.versionInfo.major >= 17;
function getVariableValues(info) {
    const variableValues = info.variableValues;
    if (IS_VARIABLE_VALUES_STRUCTURED) {
        return variableValues.coerced;
    }
    return variableValues;
}
function addVariableValue(info, name, value, type) {
    const variableValues = info.variableValues;
    if (IS_VARIABLE_VALUES_STRUCTURED) {
        const { sources, coerced } = variableValues;
        const structured = {
            sources: { ...sources, [name]: { signature: { name, type, default: undefined }, value } },
            coerced: { ...coerced, [name]: value },
        };
        return structured;
    }
    return { ...variableValues, [name]: value };
}
function getBooleanArgumentValue(info, node) {
    if (!node.arguments || node.arguments.length === 0) {
        return false;
    }
    const argument = node.arguments[0].value;
    switch (argument.kind) {
        case 'BooleanValue':
            return argument.value;
        case 'Variable':
            return getVariableValues(info)[argument.name.value];
    }
    return false;
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
