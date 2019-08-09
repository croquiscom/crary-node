import { GraphQLInputType, GraphQLResolveInfo } from 'graphql';
export interface IAddArgumentToInfoOptions {
    path?: string;
}
export declare function addArgumentToInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T, name: string, value: any, type: GraphQLInputType, options?: IAddArgumentToInfoOptions): T;
