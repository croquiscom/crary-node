"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrTimestamp = void 0;
const graphql_1 = require("graphql");
const error_1 = require("graphql/error");
const language_1 = require("graphql/language");
exports.CrTimestamp = new graphql_1.GraphQLScalarType({
    name: 'CrTimestamp',
    description: 'Serve Date object as timestamp',
    serialize(value) {
        if (value instanceof Date) {
            if (Number.isNaN(value.getTime())) {
                throw new TypeError('Value is not a valid Date');
            }
            return value.getTime();
        }
        else if (typeof value === 'number') {
            return value;
        }
        else {
            throw new TypeError(`Value is not an instance of Date or number: ${value}`);
        }
    },
    parseValue(value) {
        if (typeof value !== 'number') {
            throw new TypeError(`Value is not a valid timestamp: ${value}`);
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new TypeError(`Value is not a valid Date: ${value}`);
        }
        return date;
    },
    parseLiteral(valueAST) {
        if (valueAST.kind !== language_1.Kind.INT && valueAST.kind !== language_1.Kind.FLOAT) {
            throw new error_1.GraphQLError(`Can only parse numbers but got a: ${valueAST.kind}`);
        }
        const result = new Date(Number(valueAST.value));
        if (Number.isNaN(result.getTime())) {
            throw new error_1.GraphQLError(`Value is not a valid Date: ${valueAST.value}`);
        }
        return result;
    },
});
