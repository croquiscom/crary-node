"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookResolverAddArgument = void 0;
const graphql_1 = require("graphql");
const info_1 = require("../info");
function hookResolverAddArgument(field, name, value, type, options) {
    const { resolve = graphql_1.defaultFieldResolver } = field;
    field.resolve = async (source, args, context, info) => {
        info = info_1.addArgumentToInfo(info, name, value, type, options);
        return resolve(source, args, context, info);
    };
}
exports.hookResolverAddArgument = hookResolverAddArgument;
