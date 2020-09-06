import { GraphQLError } from 'graphql';
/**
 * 네트워크를 통해 받은 GraphQL 에러 객체를 GraphQLError 인스턴스로 변경한다
 */
export declare function convertToGraphQLError(error: any): GraphQLError;
