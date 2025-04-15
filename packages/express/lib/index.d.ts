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
type PromiseRequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs, LocalsObj extends Record<string, any> = Record<string, any>> = (req: express.Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>, res: express.Response<ResBody, LocalsObj>, next: express.NextFunction) => any;
type PromiseRouterMatcher<T> = <P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs, LocalsObj extends Record<string, any> = Record<string, any>>(path: PathParams, ...handlers: Array<PromiseRequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>) => T;
declare module 'express-serve-static-core' {
    interface IRouter {
        getPromise: PromiseRouterMatcher<this>;
        postPromise: PromiseRouterMatcher<this>;
        putPromise: PromiseRouterMatcher<this>;
        deletePromise: PromiseRouterMatcher<this>;
    }
    interface Request {
        skip_logging?: boolean;
    }
    interface Response {
        result_for_logging?: object;
        sendResult(result: object, result_for_logging?: object): void;
        sendResult(status: number, result: object, result_for_logging?: object): void;
        sendError(error: Error, cause?: Error): void;
        sendError(status: number, error: Error, cause?: Error): void;
    }
    interface Express {
        session_middleware: express.RequestHandler;
    }
}
