import { GraphQLResolveInfo } from 'graphql';
export declare function addFieldToInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T, name: string, path?: string): T;
