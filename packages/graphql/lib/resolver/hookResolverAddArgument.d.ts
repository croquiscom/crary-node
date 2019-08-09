import { GraphQLField, GraphQLInputType } from 'graphql';
export declare function hookResolverAddArgument(field: GraphQLField<any, any>, name: string, value: any, type: GraphQLInputType, options?: {
    path?: string;
}): void;
