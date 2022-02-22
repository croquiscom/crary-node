import { defaultFieldResolver, GraphQLField, GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import { IGraphQLResolveInfoMethods, wrapInfo } from '../info';

type ResolverHookFunction = (
  source: any,
  args: { [argName: string]: any },
  context: any,
  info: GraphQLResolveInfo & IGraphQLResolveInfoMethods,
  resolve: GraphQLFieldResolver<any, any>,
) => any | Promise<any>;

export function hookResolver(field: GraphQLField<any, any>, fn: ResolverHookFunction) {
  const { resolve = defaultFieldResolver } = field;
  field.resolve = (source, args, context, info) => {
    return fn(source, args, context, wrapInfo(info), resolve);
  };
}
