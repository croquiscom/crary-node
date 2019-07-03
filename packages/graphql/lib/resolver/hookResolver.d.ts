import { GraphQLField, GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import { IGraphQLResolveInfoMethods } from '../info';
declare type ResolverHookFunction = (source: any, args: {
    [argName: string]: any;
}, context: any, info: GraphQLResolveInfo & IGraphQLResolveInfoMethods, resolve: GraphQLFieldResolver<any, any>) => Promise<any>;
export declare function hookResolver(field: GraphQLField<any, any>, fn: ResolverHookFunction): void;
export {};
