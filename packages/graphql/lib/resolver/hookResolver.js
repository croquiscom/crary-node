"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookResolver = void 0;
const graphql_1 = require("graphql");
const info_1 = require("../info");
function hookResolver(field, fn) {
    const { resolve = graphql_1.defaultFieldResolver } = field;
    field.resolve = async (source, args, context, info) => {
        return fn(source, args, context, info_1.wrapInfo(info), resolve);
    };
}
exports.hookResolver = hookResolver;
