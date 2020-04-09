import { GraphQLResolveInfo } from 'graphql';
export interface IRemoveFieldFromInfoOptions {
    path?: string;
}
export declare function removeFieldFromInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T, name: string, options?: IRemoveFieldFromInfoOptions): T;
