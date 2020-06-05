import express from 'express';
import createApp from './create_app';
export { createApp }
export { shrinkStackTrace } from './util';

export type Router = express.Router;
export type Request = express.Request;
export type Response = express.Response;
export type RequestHandler = express.RequestHandler;

declare module 'express-serve-static-core' {
  export interface IRouter {
    getPromise: express.IRouterMatcher<this>;
    postPromise: express.IRouterMatcher<this>;
    putPromise: express.IRouterMatcher<this>;
    deletePromise: express.IRouterMatcher<this>;
  }

  // tslint:disable-next-line:interface-name
  export interface Request {
    skip_logging?: boolean;

    /** @internal */
    _logging: boolean;
    /** @internal */
    files: object;
  }

  // tslint:disable-next-line:interface-name
  export interface Response {
    result_for_logging: object;

    /** @internal */
    _errors: object;
    /** @internal */
    error: object;
    /** @internal */
    result: object;
    /** @internal */
    __statusCode: number;
    /** @internal */
    responseTime: number;
    /** @internal */
    __headers: any;

    sendResult(result: object, result_for_logging?: object): void;
    sendResult(status: number, result: object, result_for_logging?: object): void;
    sendError(error: Error, cause?: Error): void;
    sendError(status: number, error: Error, cause?: Error): void;

    /** @internal */
    setError(error: Error, cause?: Error): Error;
  }

  export interface Express {
    session_middleware: express.RequestHandler;
  }
}
