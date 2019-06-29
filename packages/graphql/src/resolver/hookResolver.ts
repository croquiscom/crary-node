import {
  defaultFieldResolver, GraphQLField, GraphQLFieldResolver,
  GraphQLInputType, GraphQLResolveInfo, GraphQLSchema,
} from 'graphql';
import { addArgumentToInfo, removeArgumentFromInfo } from '../info';

type GraphQLResolveInfoWithMethods = GraphQLResolveInfo & {
  addArgument(
    this: GraphQLResolveInfoWithMethods, name: string,
    value: any, type: GraphQLInputType,
  ): GraphQLResolveInfoWithMethods,
  removeArgument(this: GraphQLResolveInfoWithMethods, name: string): GraphQLResolveInfoWithMethods,
};

type ResolverHookFunction = (
  source: any,
  args: { [argName: string]: any },
  context: any,
  info: GraphQLResolveInfoWithMethods,
  resolve: GraphQLFieldResolver<any, any>,
) => Promise<any>;

export function hookResolver(field: GraphQLField<any, any>, fn: ResolverHookFunction) {
  const { resolve = defaultFieldResolver } = field;
  field.resolve = async (source, args, context, info) => {
    const infoWithMethods: GraphQLResolveInfoWithMethods = {
      ...info,
      addArgument(name, value, type) { return addArgumentToInfo(this, name, value, type); },
      removeArgument(name) { return removeArgumentFromInfo(this, name); },
    };
    return fn(source, args, context, infoWithMethods, resolve);
  };
}
