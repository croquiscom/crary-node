import { GraphQLField, GraphQLFieldResolver, GraphQLInputType, GraphQLResolveInfo } from 'graphql';
declare type GraphQLResolveInfoWithMethods = GraphQLResolveInfo & {
    addArgument(this: GraphQLResolveInfoWithMethods, name: string, value: any, type: GraphQLInputType): GraphQLResolveInfoWithMethods;
    removeArgument(this: GraphQLResolveInfoWithMethods, name: string): GraphQLResolveInfoWithMethods;
};
declare type ResolverHookFunction = (source: any, args: {
    [argName: string]: any;
}, context: any, info: GraphQLResolveInfoWithMethods, resolve: GraphQLFieldResolver<any, any>) => Promise<any>;
export declare function hookResolver(field: GraphQLField<any, any>, fn: ResolverHookFunction): void;
export {};
