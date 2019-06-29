import { defaultFieldResolver, GraphQLField, GraphQLInputType } from 'graphql';
import { addArgumentToInfo } from '../info';

export function hookResolverAddArgument(
  field: GraphQLField<any, any>, name: string, value: any, type: GraphQLInputType,
) {
  const { resolve = defaultFieldResolver } = field;
  field.resolve = async (source, args, context, info) => {
    info = addArgumentToInfo(info, name, value, type);
    return resolve(source, args, context, info);
  };
}
