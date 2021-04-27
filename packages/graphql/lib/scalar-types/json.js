"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrJson = void 0;
const graphql_1 = require("graphql");
const error_1 = require("graphql/error");
const language_1 = require("graphql/language");
function parseLiteral(valueAST, variables) {
    switch (valueAST.kind) {
        case language_1.Kind.STRING:
        case language_1.Kind.BOOLEAN:
            return valueAST.value;
        case language_1.Kind.INT:
        case language_1.Kind.FLOAT:
            return parseFloat(valueAST.value);
        case language_1.Kind.NULL:
            return null;
        case language_1.Kind.OBJECT: {
            const result = {};
            valueAST.fields.forEach((field) => {
                result[field.name.value] = parseLiteral(field.value, variables);
            });
            return result;
        }
        case language_1.Kind.LIST:
            return valueAST.values.map((v) => parseLiteral(v, variables));
        case language_1.Kind.VARIABLE:
            return variables ? variables[valueAST.name.value] : undefined;
    }
    throw new error_1.GraphQLError(`Do not support ${valueAST.kind} type`);
}
exports.CrJson = new graphql_1.GraphQLScalarType({
    name: 'CrJson',
    description: 'Serve JSON object',
    serialize(value) {
        return value;
    },
    parseValue(value) {
        return value;
    },
    parseLiteral,
});
