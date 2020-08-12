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
  conformToSchema(schema: GraphQLSchema, fragments?: { field: string; fragment: string; }[]): this;
}

export function wrapInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T): T & IGraphQLResolveInfoMethods {
  return {
    ...info,
    addArgument(name, value, type, options) { return addArgumentToInfo(this, name, value, type, options); },
    addField(name, options) { return addFieldToInfo(this, name, options); },
    removeField(name, options) { return removeFieldFromInfo(this, name, options); },
    removeArgument(name) { return removeArgumentFromInfo(this, name); },
    conformToSchema(schema, fragments) { return conformInfoToSchema(this, schema, fragments); },
  };
}
