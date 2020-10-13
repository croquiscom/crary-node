"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shrinkStackTrace = void 0;
function shrinkStackTrace(stack, project_root, limit = 3) {
    // cut first line
    stack = stack.substr(stack.indexOf('\n') + 1);
    // cut till setError call
    const pos = stack.indexOf('response.setError');
    if (pos >= 0) {
        stack = stack.substr(stack.indexOf('\n', pos) + 1);
    }
    // return first n lines with removing project path and leading spaces
    return stack.split('\n', limit).map((line) => {
        return line.replace(project_root, '').trim();
    });
}
exports.shrinkStackTrace = shrinkStackTrace;
