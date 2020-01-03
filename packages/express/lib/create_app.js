"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const helmet_1 = __importDefault(require("helmet"));
const os_1 = __importDefault(require("os"));
const redis_1 = __importDefault(require("redis"));
const logger_1 = __importDefault(require("./logger"));
const response = __importStar(require("./response"));
function wrapPromise(args) {
    if (args.length > 0) {
        const handler = args[args.length - 1];
        args[args.length - 1] = async (req, res) => {
            try {
                const result = await handler(req, res);
                res.sendResult(result || {});
            }
            catch (error) {
                res.sendError(error);
            }
        };
    }
    return args;
}
// tslint:disable-next-line:variable-name
const Router = express_1.default.Router;
Router.getPromise = function (...args) {
    return this.get.apply(this, wrapPromise(args));
};
Router.postPromise = function (...args) {
    return this.post.apply(this, wrapPromise(args));
};
Router.putPromise = function (...args) {
    return this.put.apply(this, wrapPromise(args));
};
Router.deletePromise = function (...args) {
    return this.delete.apply(this, wrapPromise(args));
};
function setupMiddlewares(app, config) {
    app.use((req, res, next) => {
        if (req.headers && req.headers['content-type']) {
            req.headers['content-type'] = req.headers['content-type'].replace(/euc-kr/ig, 'utf-8');
        }
        next();
    });
    app.use(helmet_1.default.hidePoweredBy());
    app.use(compression_1.default());
    app.use(body_parser_1.default.json({ limit: config.max_body_size || '10mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: config.max_body_size || '10mb', extended: true }));
    app.use(cookie_parser_1.default());
}
function setupSession(app, config) {
    if (!config.session) {
        return;
    }
    // tslint:disable-next-line: variable-name
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const port = (config.session.redis && config.session.redis.port) || 6379;
    const host = (config.session.redis && config.session.redis.host) || '127.0.0.1';
    const redis_client = redis_1.default.createClient(port, host);
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
    app.use(express_session_1.default({
        cookie: {
            domain: config.session.domain,
            maxAge: config.session.ttl * 1000,
        },
        name: config.session.name,
        resave: true,
        saveUninitialized: config.session.save_uninitialized || false,
        secret: config.session.secret,
        store: session_store,
    }));
}
function setupRouters(app, config) {
    // tslint:disable-next-line:forin
    for (const path in config.routers) {
        const ctor = config.routers[path];
        const router = express_1.default.Router();
        if (!path) {
            installCheck(router, config);
        }
        ctor(router, app);
        if (path) {
            app.use(path, router);
        }
        else {
            app.use(router);
        }
    }
}
function installCheck(router, config) {
    const worker_num = process.env.WORKER_NUM;
    router.get('/api/check', (req, res) => {
        req.skip_logging = true;
        const data = {
            dir: config.project_root,
            hostname: os_1.default.hostname(),
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
function setupErrorHandler(app, config) {
    app.use((err, req, res, next) => {
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
exports.default = (config) => {
    const app = express_1.default();
    app.set('trust proxy', true);
    if (config.log4js_config) {
        app.use(logger_1.default(config));
    }
    setupMiddlewares(app, config);
    setupSession(app, config);
    setupRouters(app, config);
    setupErrorHandler(app, config);
    app.response._errors = config.errors || {};
    response.install(app.response);
    return app;
};
