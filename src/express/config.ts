import express from 'express';
import log4js from 'log4js';

export interface IExpressConfig {
  project_root: string;
  log4js_config?: log4js.Configuration;
  redis_host?: string;
  redis_port?: number;
  redis_password?: string;
  session_ttl: number;
  session_secret: string;
  session_save_uninitialized?: boolean;
  session_domain?: string;
  errors?: { [key: string]: Error };
  routers: { [path: string]: (router: express.Router, app: express.Application) => void };
  max_body_size?: number | string;
}
