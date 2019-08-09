import { GraphQLInputType, GraphQLResolveInfo, GraphQLSchema } from 'graphql';
import { addArgumentToInfo } from './addArgumentToInfo';
export { addArgumentToInfo };
import { addFieldToInfo } from './addFieldToInfo';
export { addFieldToInfo };
import { conformInfoToSchema } from './conformInfoToSchema';
export { conformInfoToSchema };
export { getFieldList, getFieldList1st } from './getFieldList';
export { getFieldString } from './getFieldString';
import { removeArgumentFromInfo } from './removeArgumentFromInfo';
export { removeArgumentFromInfo };
export interface IGraphQLResolveInfoMethods {
    addArgument(name: string, value: any, type: GraphQLInputType, path?: string): this;
    addField(name: string, path?: string): this;
    removeArgument(name: string): this;
    conformToSchema(schema: GraphQLSchema, fragments?: Array<{
        field: string;
        fragment: string;
    }>): this;
}
export declare function wrapInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T): T & IGraphQLResolveInfoMethods;
