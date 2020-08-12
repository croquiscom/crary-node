import { GraphQLInputType, GraphQLResolveInfo, GraphQLSchema } from 'graphql';
import { addArgumentToInfo, IAddArgumentToInfoOptions } from './addArgumentToInfo';
import { addFieldToInfo, IAddFieldToInfoOptions } from './addFieldToInfo';
import { conformInfoToSchema } from './conformInfoToSchema';
import { removeArgumentFromInfo } from './removeArgumentFromInfo';
import { IRemoveFieldFromInfoOptions, removeFieldFromInfo } from './removeFieldFromInfo';
export { addArgumentToInfo };
export { addFieldToInfo };
export { conformInfoToSchema };
export { getFieldSet, getSubFieldNode, getFieldList, getFieldList1st } from './getFieldList';
export { getFieldString } from './getFieldString';
export { removeArgumentFromInfo };
export { removeFieldFromInfo };
export interface IGraphQLResolveInfoMethods {
    addArgument(name: string, value: any, type: GraphQLInputType, options?: IAddArgumentToInfoOptions): this;
    addField(name: string, options?: IAddFieldToInfoOptions): this;
    removeField(name: string, options?: IRemoveFieldFromInfoOptions): this;
    removeArgument(name: string): this;
    conformToSchema(schema: GraphQLSchema, fragments?: {
        field: string;
        fragment: string;
    }[]): this;
}
export declare function wrapInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T): T & IGraphQLResolveInfoMethods;
