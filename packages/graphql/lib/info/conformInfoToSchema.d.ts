import { GraphQLResolveInfo, GraphQLSchema } from 'graphql';
import { MergeInfo } from 'graphql-tools';
export declare function conformInfoToSchema(info: GraphQLResolveInfo & {
    mergeInfo: MergeInfo;
}, schema: GraphQLSchema, fragments: Array<{
    field: string;
    fragment: string;
}>): GraphQLResolveInfo & {
    mergeInfo: MergeInfo;
};
