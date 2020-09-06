import { GraphQLError } from 'graphql';

export class CraryGraphQLError extends GraphQLError {
  code?: string;
  ignorable?: boolean;

  constructor(graphql_error_object: any) {
    const { ...extensions } = graphql_error_object.extensions;
    delete extensions.stack;
    super(
      graphql_error_object.message,
      graphql_error_object.nodes,
      graphql_error_object.source,
      graphql_error_object.positions,
      graphql_error_object.path,
      undefined,
      extensions,
    );
    this.code = extensions?.code;
    this.ignorable = extensions?.ignorable;
  }
}

/**
 * 네트워크를 통해 받은 GraphQL 에러 객체를 CraryGraphQLError 인스턴스로 변경한다
 */
export function convertToCraryGraphQLError(graphql_error_object: any): CraryGraphQLError {
  return new CraryGraphQLError(graphql_error_object);
}
