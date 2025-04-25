import express from 'express';
import expressSession, { SessionData } from 'express-session';
import log4js from 'log4js';

export interface IExpressConfig {
  project_name?: string;
  project_root: string;
  log4js_config?: log4js.Configuration;
  session?: {
    redis?: {
      host?: string;
      port?: number;
      db?: number;
      password?: string;
    };
    ttl: number;
    custom_ttl?: (sess: SessionData) => number;
    secret: string;
    name?: string;
    save_uninitialized?: boolean;
    rolling?: boolean;
    domain?: string;
    /**
     * set express-session cookie.secure option
     */
    secure?: boolean;
    same_site?: boolean | 'lax' | 'strict' | 'none';
    custom_module?: typeof expressSession;
    redis_store_prefix?: string;
    redis_connection_name?: string;
  };
  errors?: { [key: string]: Error };
  routers: { [path: string]: (router: express.Router, app: express.Application) => void };
  max_body_size?: number | string;
  hooks?: {
    after_create_app?: (app: express.Application) => void;
  };
}
