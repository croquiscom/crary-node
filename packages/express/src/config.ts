import express from 'express';
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
    secret: string;
    name?: string;
    save_uninitialized?: boolean;
    domain?: string;
    /**
     * set express-session cookie.secure option
     */
    secure?: boolean;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
  };
  errors?: { [key: string]: Error };
  routers: { [path: string]: (router: express.Router, app: express.Application) => void };
  max_body_size?: number | string;
}
