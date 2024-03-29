import express from 'express';
import createApp from './create_app';
export { createApp };
export { shrinkStackTrace } from './util';
export type Router = express.Router;
export type Request = express.Request;
export type Response = express.Response;
export type RequestHandler = express.RequestHandler;
export type Application = express.Application;
declare module 'express-serve-static-core' {
    interface IRouter {
        getPromise: express.IRouterMatcher<this>;
        postPromise: express.IRouterMatcher<this>;
        putPromise: express.IRouterMatcher<this>;
        deletePromise: express.IRouterMatcher<this>;
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
