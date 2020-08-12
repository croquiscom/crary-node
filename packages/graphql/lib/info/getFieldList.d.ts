import { FieldNode, FragmentDefinitionNode, GraphQLResolveInfo, InlineFragmentNode } from 'graphql';
export declare const getFieldSet: (info: GraphQLResolveInfo, nodes: readonly (FieldNode | InlineFragmentNode | FragmentDefinitionNode)[], depth?: number) => Set<string>;
export declare function getSubFieldNode(info: GraphQLResolveInfo, nodes: ReadonlyArray<FieldNode | InlineFragmentNode | FragmentDefinitionNode>, fieldName?: string): FieldNode | undefined;
export declare function getFieldList(info: GraphQLResolveInfo, fieldName?: string): string[];
export declare function getFieldList1st(info: GraphQLResolveInfo, fieldName?: string): string[];
