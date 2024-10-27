"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookResolverAddArgument = hookResolverAddArgument;
const graphql_1 = require("graphql");
const info_1 = require("../info");
function hookResolverAddArgument(field, name, value, type, options) {
    const { resolve = graphql_1.defaultFieldResolver } = field;
    field.resolve = (source, args, context, info) => {
        info = (0, info_1.addArgumentToInfo)(info, name, value, type, options);
        return resolve(source, args, context, info);
    };
}
