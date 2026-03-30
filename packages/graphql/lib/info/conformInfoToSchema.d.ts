import type { GraphQLResolveInfo } from 'graphql';
import { GraphQLSchema } from 'graphql';
export declare function conformInfoToSchema<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T, schema: GraphQLSchema, field_name?: string): T;
