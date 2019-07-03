import { GraphQLResolveInfo, GraphQLSchema } from 'graphql';
export declare function conformInfoToSchema<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T, schema: GraphQLSchema, fragments: Array<{
    field: string;
    fragment: string;
}>): T;
