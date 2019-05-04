import express_core from 'express-serve-static-core';
import log4js from 'log4js';

export interface ExpressApp extends express_core.Express { }

export interface ExpressRequestHandler {
  (req: ExpressRequest, res: ExpressResponse, next: express_core.NextFunction): any;
}

type ExpressErrorRequestHandler = (err: any, req: ExpressRequest, res: ExpressResponse, next: express_core.NextFunction) => any;

type ExpressRequestHandlerParams = ExpressRequestHandler | ExpressErrorRequestHandler | Array<ExpressRequestHandler | ExpressErrorRequestHandler>;

interface IRouterMatcher<T> {
  (path: express_core.PathParams, ...handlers: ExpressRequestHandler[]): T;
  (path: express_core.PathParams, ...handlers: ExpressRequestHandlerParams[]): T;
}

export interface ExpressRouter extends express_core.Router {
  all: IRouterMatcher<this>;
  get: IRouterMatcher<this>;
  post: IRouterMatcher<this>;
  put: IRouterMatcher<this>;
  delete: IRouterMatcher<this>;
  patch: IRouterMatcher<this>;
  options: IRouterMatcher<this>;
  head: IRouterMatcher<this>;

  getPromise: IRouterMatcher<this>;
  postPromise: IRouterMatcher<this>;
  putPromise: IRouterMatcher<this>;
  deletePromise: IRouterMatcher<this>;
}

export interface ExpressRequest extends express_core.Request {
}

export interface ExpressResponse extends express_core.Response {
  sendResult(result: object, result_for_logging?: object): void;
  sendResult(status: number, result: object, result_for_logging?: object): void;
  sendError(error: Error, cause?: Error): void;
  sendError(status: number, error: Error, cause?: Error): void;
  result_for_logging: object;
}

interface ExpressConfig {
  project_root: string;
  log4js_config?: log4js.Configuration;
  redis_host?: string;
  redis_port?: number;
  session_ttl: number;
  session_secret: string;
  session_save_uninitialized?: boolean;
  session_domain?: string;
  errors?: { [key: string]: Error };
  routers: { [path: string]: (router: ExpressRouter, app: ExpressApp) => void };
  max_body_size?: number | string;
}

interface Express {
  createApp(config: ExpressConfig): ExpressApp;
}

export declare const express: Express;
