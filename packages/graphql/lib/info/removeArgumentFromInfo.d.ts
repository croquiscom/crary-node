import { GraphQLResolveInfo } from 'graphql';
export declare function removeArgumentFromInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T, name: string): T;
