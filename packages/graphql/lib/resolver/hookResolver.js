"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookResolver = hookResolver;
const graphql_1 = require("graphql");
const info_1 = require("../info");
function hookResolver(field, fn) {
    const { resolve = graphql_1.defaultFieldResolver } = field;
    field.resolve = (source, args, context, info) => {
        return fn(source, args, context, (0, info_1.wrapInfo)(info), resolve);
    };
}
