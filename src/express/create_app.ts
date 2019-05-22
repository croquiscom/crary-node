import bodyParser from 'body-parser';
import compression from 'compression';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import express from 'express';
import expressSession from 'express-session';
import os from 'os';
import redis from 'redis';
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
      } catch (error) {
        res.sendError(error);
      }
    };
  }
  return args;
}

// tslint:disable-next-line:variable-name
const Router = express.Router as unknown as express.Router;

Router.getPromise = function(...args: any[]) {
  return this.get.apply(this, wrapPromise(args));
};

Router.postPromise = function(...args: any[]) {
  return this.post.apply(this, wrapPromise(args));
};

Router.putPromise = function(...args: any[]) {
  return this.put.apply(this, wrapPromise(args));
};

Router.deletePromise = function(...args: any[]) {
  return this.delete.apply(this, wrapPromise(args));
};

function setupMiddlewares(app: express.Express, config: IExpressConfig) {
  app.use((req, res, next) => {
    if (req.headers && req.headers['content-type']) {
      req.headers['content-type'] = req.headers['content-type'].replace(/euc-kr/ig, 'utf-8');
    }
    next();
  });
  app.use(compression());
  app.use(bodyParser.json({ limit: config.max_body_size || '10mb' }));
  app.use(bodyParser.urlencoded({ limit: config.max_body_size || '10mb', extended: true }));
  app.use(cookieParser());
}

function setupSession(app: express.Express, config: IExpressConfig) {
  // tslint:disable-next-line: variable-name
  const RedisStore = connectRedis(expressSession);
  const redis_client = redis.createClient(config.redis_port || 6379, config.redis_host || '127.0.0.1');
  const session_store = new RedisStore({
    client: redis_client,
    pass: config.redis_password,
    ttl: config.session_ttl,
  });
  session_store.on('disconnect', () => {
    console.log('RedisStore for express is disconnected. Exit the process...');
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });
  app.use(expressSession({
    cookie: {
      domain: config.session_domain,
      maxAge: config.session_ttl * 1000,
    },
    name: config.session_name,
    resave: true, // session expire를 초기로 돌리기 위해서 매번 다시 저장한다
    saveUninitialized: config.session_save_uninitialized || false,
    secret: config.session_secret,
    store: session_store,
  }));
}

function setupRouters(app: express.Express, config: IExpressConfig) {
  // tslint:disable-next-line:forin
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
    if (req.session == null) {
      data.session = false;
      res.status(400);
    }
    res.type('application/json; charset=utf-8');
    res.json(data);
  });
}

function setupErrorHandler(app: express.Express, config: IExpressConfig) {
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(err instanceof Error)) {
      err = new Error(err);
    }
    res.error = err;
    let code = err.status || res.statusCode;
    if (code < 400) {
      code = 500;
    }
    res.type('application/json; charset=utf-8')
      .status(code)
      .json({ error: err.message });
  });
}

export default (config: IExpressConfig) => {
  const app = express();
  app.set('trust proxy', true);
  if (config.log4js_config) {
    app.use(logger(config));
  }
  setupMiddlewares(app, config);
  setupSession(app, config);
  setupRouters(app, config);
  setupErrorHandler(app, config);
  app.response._errors = config.errors || {};
  response.install(app.response);
  return app;
};
