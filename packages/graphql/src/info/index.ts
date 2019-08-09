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

export interface IGraphQLResolveInfoMethods {
  addArgument(name: string, value: any, type: GraphQLInputType, options?: IAddArgumentToInfoOptions): this;
  addField(name: string, options?: IAddFieldToInfoOptions): this;
  removeArgument(name: string): this;
  conformToSchema(schema: GraphQLSchema, fragments?: Array<{ field: string; fragment: string; }>): this;
}

export function wrapInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T): T & IGraphQLResolveInfoMethods {
  return {
    ...info,
    addArgument(name, value, type, options) { return addArgumentToInfo(this, name, value, type, options); },
    addField(name, options) { return addFieldToInfo(this, name, options); },
    removeArgument(name) { return removeArgumentFromInfo(this, name); },
    conformToSchema(schema, fragments) { return conformInfoToSchema(this, schema, fragments); },
  };
}
