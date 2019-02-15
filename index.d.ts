import * as express_core from 'express-serve-static-core';
import * as log4js from 'log4js';

export interface ExpressApp extends express_core.Express { }

export interface ExpressRouter extends express_core.Router {
  getPromise: express_core.IRouterMatcher<this>;
  postPromise: express_core.IRouterMatcher<this>;
  putPromise: express_core.IRouterMatcher<this>;
  deletePromise: express_core.IRouterMatcher<this>;
}

export interface ExpressResponse extends express_core.Response {
  sendError(error: Error, cause?: Error): void;
  sendError(status: number, error: Error, cause?: Error): void;
  result_for_logging: object;
}

interface ExpressConfig {
  project_root: string;
  log4js_config?: log4js.IConfig;
  session_redis_host?: string;
  session_redis_port?: number;
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
