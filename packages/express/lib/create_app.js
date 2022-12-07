"use strict";
/* eslint-disable prefer-spread */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const helmet_1 = require("helmet");
const ioredis_1 = __importDefault(require("ioredis"));
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
        if (req.headers['content-type']) {
            req.headers['content-type'] = req.headers['content-type'].replace(/euc-kr/gi, 'utf-8');
        }
        next();
    });
    app.use((0, helmet_1.hidePoweredBy)());
    app.use((0, compression_1.default)());
    app.use(body_parser_1.default.json({ limit: config.max_body_size || '10mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: config.max_body_size || '10mb', extended: true }));
    app.use((0, cookie_parser_1.default)());
}
function setupSession(app, config) {
    if (!config.session) {
        return;
    }
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const port = config.session.redis?.port ?? 6379;
    const host = config.session.redis?.host ?? '127.0.0.1';
    const redis_client = new ioredis_1.default({
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
    const session_middleware = (0, express_session_1.default)({
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
function setupRouters(app, config) {
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
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (req.session == null) {
            data.session = false;
            res.status(400);
        }
        req.sessionID = undefined; // session이 생성되지 않도록 한다
        res.type('application/json; charset=utf-8');
        res.json(data);
    });
}
function setupErrorHandler(app) {
    app.use((err, req, res) => {
        if (!(err instanceof Error)) {
            err = new Error(err);
        }
        res.error = err;
        let code = err.status || res.statusCode;
        if (code < 400) {
            code = 500;
        }
        res.type('application/json; charset=utf-8').status(code).json({ error: err.message });
    });
}
exports.default = (config) => {
    const app = (0, express_1.default)();
    if (config.hooks?.after_create_app) {
        config.hooks.after_create_app(app);
    }
    app.set('trust proxy', true);
    if (config.log4js_config) {
        app.use((0, logger_1.default)(config));
    }
    setupMiddlewares(app, config);
    setupSession(app, config);
    setupRouters(app, config);
    setupErrorHandler(app);
    app.response._errors = config.errors || {};
    response.install(app.response);
    return app;
};
