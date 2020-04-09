import { GraphQLInputType, GraphQLResolveInfo, GraphQLSchema } from 'graphql';
import { addArgumentToInfo, IAddArgumentToInfoOptions } from './addArgumentToInfo';
export { addArgumentToInfo };
import { addFieldToInfo, IAddFieldToInfoOptions } from './addFieldToInfo';
export { addFieldToInfo };
import { conformInfoToSchema } from './conformInfoToSchema';
export { conformInfoToSchema };
export { getFieldList, getFieldList1st } from './getFieldList';
export { getFieldString } from './getFieldString';
import { removeArgumentFromInfo } from './removeArgumentFromInfo';
export { removeArgumentFromInfo };
import { removeFieldFromInfo, IRemoveFieldFromInfoOptions } from './removeFieldFromInfo';
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
