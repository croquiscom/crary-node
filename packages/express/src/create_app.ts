/* eslint-disable prefer-spread */

import os from 'os';
import { json, urlencoded } from 'body-parser';
import compression from 'compression';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import express, { ErrorRequestHandler } from 'express';
import expressSession from 'express-session';
import { hidePoweredBy } from 'helmet';
import Redis from 'ioredis';
import { IExpressConfig } from './config';
import logger from './logger';
import * as response from './response';

function wrapPromise(args: any[]): any {
  if (args.length > 0) {
    const handler = args[args.length - 1];
    args[args.length - 1] = async (req: express.Request, res: express.Response) => {
      try {
        const result = await handler(req, res);
        res.sendResult(result || {});
      } catch (error: any) {
        res.sendError(error);
      }
    };
  }
  return args;
}

const Router = express.Router as unknown as express.Router;

Router.getPromise = function (...args: any[]) {
  return this.get.apply(this, wrapPromise(args));
};

Router.postPromise = function (...args: any[]) {
  return this.post.apply(this, wrapPromise(args));
};

Router.putPromise = function (...args: any[]) {
  return this.put.apply(this, wrapPromise(args));
};

Router.deletePromise = function (...args: any[]) {
  return this.delete.apply(this, wrapPromise(args));
};

function setupMiddlewares(app: express.Express, config: IExpressConfig) {
  app.use((req, res, next) => {
    if (req.headers['content-type']) {
      req.headers['content-type'] = req.headers['content-type'].replace(/euc-kr/gi, 'utf-8');
    }
    next();
  });
  app.use(hidePoweredBy());
  app.use(compression());
  app.use(json({ limit: config.max_body_size || '10mb' }));
  app.use(urlencoded({ limit: config.max_body_size || '10mb', extended: true }));
  app.use(cookieParser());
}

function setupSession(app: express.Express, config: IExpressConfig) {
  if (!config.session) {
    return;
  }
  const customExpressSession = config.session.custom_module ?? expressSession;
  const RedisStore = connectRedis(customExpressSession);
  const port = config.session.redis?.port ?? 6379;
  const host = config.session.redis?.host ?? '127.0.0.1';
  const redis_client = new Redis({
    port,
    host,
    db: config.session.redis?.db,
  });
  const session_store = new RedisStore({
    client: redis_client,
    pass: config.session.redis && config.session.redis.password,
    ttl: config.session.ttl,
  });
  session_store.on('disconnect', () => {
    console.log('RedisStore for express is disconnected. Exit the process...');
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });
  const session_middleware = customExpressSession({
    cookie: {
      domain: config.session.domain,
      maxAge: config.session.ttl * 1000,
      secure: config.session.secure,
      sameSite: config.session.same_site,
    },
    name: config.session.name,
    resave: false,
    rolling: true,
    saveUninitialized: config.session.save_uninitialized || false,
    secret: config.session.secret,
    store: session_store,
  });
  app.session_middleware = session_middleware;
  app.use(session_middleware);
}

function setupRouters(app: express.Express, config: IExpressConfig) {
  for (const path in config.routers) {
    const ctor = config.routers[path];
    const router = express.Router();
    if (!path) {
      installCheck(router, config);
    }
    ctor(router, app);
    if (path) {
      app.use(path, router);
    } else {
      app.use(router);
    }
  }
}

function installCheck(router: express.Router, config: IExpressConfig) {
  const worker_num = process.env.WORKER_NUM;
  router.get('/api/check', (req, res) => {
    req.skip_logging = true;
    const data = {
      dir: config.project_root,
      hostname: os.hostname(),
      memory: process.memoryUsage(),
      nodejs: process.version,
      session: true,
      uptime: process.uptime(),
      worker_num,
    };
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (req.session == null) {
      data.session = false;
      res.status(400);
    }
    req.sessionID = undefined as any; // session이 생성되지 않도록 한다
    res.type('application/json; charset=utf-8');
    res.json(data);
  });
}

function setupErrorHandler(app: express.Express) {
  const error_handler: ErrorRequestHandler = (err, req, res, _next) => {
    if (!(err instanceof Error)) {
      err = new Error(err);
    }
    res.error = err;
    let code = err.status || res.statusCode;
    if (code < 400) {
      code = 500;
    }
    res.type('application/json; charset=utf-8').status(code).json({ error: err.message });
  };
  app.use(error_handler);
}

export default (config: IExpressConfig) => {
  const app = express();
  if (config.hooks?.after_create_app) {
    config.hooks.after_create_app(app);
  }
  app.set('trust proxy', true);
  if (config.log4js_config) {
    app.use(logger(config));
  }
  setupMiddlewares(app, config);
  setupSession(app, config);
  setupRouters(app, config);
  setupErrorHandler(app);
  app.response._errors = config.errors || {};
  response.install(app.response);
  return app;
};
