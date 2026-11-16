import type { GraphQLInputType, GraphQLResolveInfo, SelectionNode } from 'graphql';
type ObjMap = Record<string, unknown>;
export declare function getVariableValues(info: GraphQLResolveInfo): ObjMap;
export declare function addVariableValue(info: GraphQLResolveInfo, name: string, value: unknown, type: GraphQLInputType): GraphQLResolveInfo['variableValues'];
export declare function isExcludedByDirective(info: GraphQLResolveInfo, node: SelectionNode): boolean;
export {};
