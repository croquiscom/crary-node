"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractQueryList = void 0;
function extractQueryList(text) {
    return text
        .split('\n')
        .map((str) => str
        .trim()
        .replace(/^query /, '✓query ')
        .replace(/^mutation /, '✓mutation ')
        .replace(/^fragment /, '✓fragment '))
        .join(' ')
        .replace(/✓mutation /g, '\nmutation ')
        .replace(/✓query /g, '\nquery ')
        .replace(/✓fragment /g, '\nfragment ')
        .trim()
        .split('\n');
}
exports.extractQueryList = extractQueryList;
