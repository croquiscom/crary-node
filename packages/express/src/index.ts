import express from 'express';
import { type ParamsDictionary, type PathParams } from 'express-serve-static-core';
import { type ParsedQs } from 'qs';
import createApp from './create_app';
export { createApp };
export { shrinkStackTrace } from './util';

export type Router = express.Router;
export type Request = express.Request;
export type Response = express.Response;
export type RequestHandler = express.RequestHandler;
export type Application = express.Application;

type PromiseRequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  LocalsObj extends Record<string, any> = Record<string, any>,
> = (
  req: express.Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
  res: express.Response<ResBody, LocalsObj>,
  next: express.NextFunction,
) => any; // can return any including a promise

type PromiseRouterMatcher<T> = <
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  LocalsObj extends Record<string, any> = Record<string, any>,
>(
  path: PathParams,
  // (This generic is meant to be passed explicitly.)
  ...handlers: Array<PromiseRequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
) => T;

declare module 'express-serve-static-core' {
  export interface IRouter {
    getPromise: PromiseRouterMatcher<this>;
    postPromise: PromiseRouterMatcher<this>;
    putPromise: PromiseRouterMatcher<this>;
    deletePromise: PromiseRouterMatcher<this>;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface Request {
    skip_logging?: boolean;

    /** @internal */
    _logging: boolean;
    /** @internal */
    files?: object;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface Response {
    result_for_logging?: object;

    /** @internal */
    _errors: Record<string, Error | undefined>;
    /** @internal */
    error: object;
    /** @internal */
    result?: object;
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
