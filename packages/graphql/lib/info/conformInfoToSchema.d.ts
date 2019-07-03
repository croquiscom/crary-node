import { GraphQLResolveInfo, GraphQLSchema } from 'graphql';
import { MergeInfo } from 'graphql-tools';
export declare function conformInfoToSchema<T extends GraphQLResolveInfo & {
    mergeInfo?: MergeInfo;
} = GraphQLResolveInfo>(info: T, schema: GraphQLSchema, fragments?: Array<{
    field: string;
    fragment: string;
}>): T;
