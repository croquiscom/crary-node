import { GraphQLInputType, GraphQLResolveInfo, GraphQLSchema } from 'graphql';

import { addArgumentToInfo } from './addArgumentToInfo';
export { addArgumentToInfo };
import { conformInfoToSchema } from './conformInfoToSchema';
export { conformInfoToSchema };
export { getFieldList, getFieldList1st } from './getFieldList';
export { getFieldString } from './getFieldString';
import { removeArgumentFromInfo } from './removeArgumentFromInfo';
export { removeArgumentFromInfo };

export interface IGraphQLResolveInfoMethods {
  addArgument(name: string, value: any, type: GraphQLInputType, path?: string): this;
  removeArgument(name: string): this;
  conformToSchema(schema: GraphQLSchema, fragments?: Array<{ field: string; fragment: string; }>): this;
}

export function wrapInfo<T extends GraphQLResolveInfo = GraphQLResolveInfo>(info: T): T & IGraphQLResolveInfoMethods {
  return {
    ...info,
    addArgument(name, value, type, path) { return addArgumentToInfo(this, name, value, type, path); },
    removeArgument(name) { return removeArgumentFromInfo(this, name); },
    conformToSchema(schema, fragments) { return conformInfoToSchema(this, schema, fragments); },
  };
}
