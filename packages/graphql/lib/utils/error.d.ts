import { GraphQLError } from 'graphql';
/**
 * crary-express가 남기는 로그에 적합하게 처리된 GraphQLError 클래스.
 *
 * extensions에 있는 code/ignorable를 로그 남길 때 사용할 수 있도록 구성한다.
 */
export declare class CraryGraphQLError extends GraphQLError {
    code?: string;
    ignorable?: boolean;
    constructor(graphql_error_object: any);
}
/**
 * 네트워크를 통해 받은 GraphQL 에러 객체를 CraryGraphQLError 인스턴스로 변경한다
 */
export declare function convertToCraryGraphQLError(graphql_error_object: any): CraryGraphQLError;
