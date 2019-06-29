"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const info_1 = require("../info");
function hookResolver(field, fn) {
    const { resolve = graphql_1.defaultFieldResolver } = field;
    field.resolve = async (source, args, context, info) => {
        const infoWithMethods = Object.assign({}, info, { addArgument(name, value, type) { return info_1.addArgumentToInfo(this, name, value, type); },
            removeArgument(name) { return info_1.removeArgumentFromInfo(this, name); } });
        return fn(source, args, context, infoWithMethods, resolve);
    };
}
exports.hookResolver = hookResolver;
