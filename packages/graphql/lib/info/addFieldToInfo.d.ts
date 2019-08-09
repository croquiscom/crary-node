import { GraphQLResolveInfo } from 'graphql';
export interface IAddFieldToInfoOptions {
    path?: string;
}
export declare function addFieldToInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T, name: string, options?: IAddFieldToInfoOptions): T;
