import { GraphQLError } from 'graphql';

/**
 * 네트워크를 통해 받은 GraphQL 에러 객체를 GraphQLError 인스턴스로 변경한다
 */
export function convertToGraphQLError(error: any): GraphQLError {
  const { ...extensions } = error.extensions;
  delete extensions.stack;
  const converted = new GraphQLError(
    error.message,
    error.nodes,
    error.source,
    error.positions,
    error.path,
    undefined,
    extensions,
  );
  (converted as any).code = extensions?.code;
  (converted as any).ignorable = extensions?.ignorable;
  return converted;
}
