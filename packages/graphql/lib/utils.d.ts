import { GraphQLError } from 'graphql';
export declare class CraryGraphQLError extends GraphQLError {
    code?: string;
    ignorable?: boolean;
    constructor(graphql_error_object: any);
}
/**
 * 네트워크를 통해 받은 GraphQL 에러 객체를 CraryGraphQLError 인스턴스로 변경한다
 */
export declare function convertToCraryGraphQLError(graphql_error_object: any): CraryGraphQLError;
