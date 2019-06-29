import { GraphQLInputType, GraphQLResolveInfo } from 'graphql';
export declare function addArgumentToInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T, name: string, value: any, type: GraphQLInputType): T;
