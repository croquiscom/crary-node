import { DynamoDB } from 'aws-sdk';
export declare const is_real_db: boolean;
declare function getEndPoint(): string;
export declare const dynamodb: DynamoDB;
declare function define(name: any, schema: any): any;
declare const types: any;
export { types, define, getEndPoint };
