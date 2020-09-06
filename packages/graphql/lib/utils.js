"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToGraphQLError = void 0;
const graphql_1 = require("graphql");
/**
 * 네트워크를 통해 받은 GraphQL 에러 객체를 GraphQLError 인스턴스로 변경한다
 */
function convertToGraphQLError(error) {
    const extensions = __rest(error.extensions, []);
    delete extensions.stack;
    const converted = new graphql_1.GraphQLError(error.message, error.nodes, error.source, error.positions, error.path, undefined, extensions);
    converted.code = extensions === null || extensions === void 0 ? void 0 : extensions.code;
    converted.ignorable = extensions === null || extensions === void 0 ? void 0 : extensions.ignorable;
    return converted;
}
exports.convertToGraphQLError = convertToGraphQLError;
