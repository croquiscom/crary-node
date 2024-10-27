"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraryGraphQLError = void 0;
exports.convertToCraryGraphQLError = convertToCraryGraphQLError;
const graphql_1 = require("graphql");
/**
 * crary-express가 남기는 로그에 적합하게 처리된 GraphQLError 클래스.
 *
 * extensions에 있는 code/ignorable를 로그 남길 때 사용할 수 있도록 구성한다.
 */
class CraryGraphQLError extends graphql_1.GraphQLError {
    constructor(graphql_error_object) {
        const { ...extensions } = graphql_error_object.extensions ?? {};
        delete extensions.stack;
        super(graphql_error_object.message, graphql_error_object.nodes, graphql_error_object.source, graphql_error_object.positions, graphql_error_object.path, undefined, extensions);
        this.code = extensions?.code;
        this.ignorable = extensions?.ignorable;
    }
}
exports.CraryGraphQLError = CraryGraphQLError;
/**
 * 네트워크를 통해 받은 GraphQL 에러 객체를 CraryGraphQLError 인스턴스로 변경한다
 */
function convertToCraryGraphQLError(graphql_error_object) {
    return new CraryGraphQLError(graphql_error_object);
}
