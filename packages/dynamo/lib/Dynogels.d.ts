import { DynamoDB } from 'aws-sdk';
declare function define(name: any, schema: any): any;
export declare function setDynamoDriver(driver: DynamoDB): void;
declare const types: any;
export { types, define };
