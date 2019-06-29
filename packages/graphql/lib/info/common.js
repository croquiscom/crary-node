"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBooleanArgumentValue(info, node) {
    if (!node.arguments || node.arguments.length === 0) {
        return false;
    }
    const argument = node.arguments[0].value;
    switch (argument.kind) {
        case 'BooleanValue':
            return argument.value;
        case 'Variable':
            return info.variableValues[argument.name.value];
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
exports.isExcludedByDirective = isExcludedByDirective;
