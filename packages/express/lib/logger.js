"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const cookie_1 = require("cookie");
const log4js_1 = __importDefault(require("log4js"));
const on_finished_1 = __importDefault(require("on-finished"));
const util_2 = require("./util");
let tracer;
let formats;
try {
    tracer = require('dd-trace');
    formats = require('dd-trace/ext/formats');
}
catch (error) {
    // ignore
}
log4js_1.default.addLayout('json', () => {
    return (logEvent) => {
        const data = logEvent.data[0].toJSON();
        if (tracer) {
            const span = tracer.scope().active();
            if (span) {
                tracer.inject(span.context(), formats.LOG, data);
            }
        }
        return JSON.stringify({
            '@timestamp': logEvent.startTime.toISOString(),
            'loglevel': logEvent.level.toString(),
            'service_name': logEvent.categoryName,
            ...data,
        });
    };
});
exports.default = (config) => {
    log4js_1.default.configure(config.log4js_config);
    const logger = log4js_1.default.getLogger(config.project_name || 'express');
    const project_root = config.project_root + '/';
    const format = (req, res) => {
        if (req.skip_logging) {
            return '';
        }
        let e = res.error;
        let error_code;
        let error_ignorable;
        let error_message;
        let error_stack;
        let error_cause_message;
        if (e) {
            error_code = e.code || e._code;
            error_ignorable = e.ignorable;
            error_message = e._code || e.message;
            if (!e._code && e.stack) {
                error_stack = (0, util_2.shrinkStackTrace)(e.stack, project_root, 3);
            }
            e = e.cause;
            if (e) {
                error_cause_message = e.message;
            }
        }
        let url = req.originalUrl;
        const query_pos = url.indexOf('?');
        if (query_pos >= 0) {
            url = url.substr(0, query_pos);
        }
        if (url[url.length - 1] === '/') {
            url = url.substr(0, url.length - 1);
        }
        let given_session;
        if (req.headers.cookie) {
            const cookies = (0, cookie_1.parse)(req.headers.cookie);
            const raw = cookies[config.session?.name ?? 'connect.sid'];
            if (raw && raw.substring(0, 2) === 's:') {
                given_session = raw.slice(2, raw.lastIndexOf('.'));
            }
        }
        return {
            toJSON() {
                return {
                    session: this.C.s.substring(0, 6),
                    given_session: given_session?.substring(0, 6),
                    user_id: req.session?.user_id,
                    user_uuid: req.session?.user_uuid?.substring(0, 6),
                    request_method: this.I.m,
                    request_url: this.I.u,
                    response: this.O.s,
                    response_time: this.C.t,
                    clientip: this.C.a,
                    httpversion: this.I.v,
                    bytes: this.O.l,
                    referrer: this.I.r,
                    agent: this.I.a,
                    request_params: this.I.q,
                    request_body: this.I.b,
                    response_data: this.O.r,
                    error_message: this.O.e,
                    error_code: this.O.c,
                    error_stack: this.O.es,
                    error_ignorable: this.O.i,
                };
            },
            [util_1.default.inspect.custom]() {
                let msg = `<${this.C.s.substr(0, 6)}> [${this.C.t}ms] ${this.C.a} - -`;
                msg += ` "${this.I.m} ${this.I.u} HTTP/${this.I.v}" ${this.O.s} ${this.O.l} "${this.I.r}" "${this.I.a}"`;
                msg += `\n\tI] q: ${JSON.stringify(this.I.q)}, b: ${JSON.stringify(this.I.b)}, f: ${JSON.stringify(this.I.f)}`;
                if (this.O.r) {
                    msg += `\n\tO] ${JSON.stringify(this.O.r)}`;
                }
                if (this.O.e) {
                    msg += `\n\tE] ${this.O.e}`;
                    if (this.O.ec) {
                        msg += ` CAUSED BY ${this.O.ec}`;
                    }
                    if (this.O.es) {
                        msg += this.O.es
                            .map((line) => {
                            return '\n\t' + line;
                        })
                            .join('');
                    }
                }
                return msg;
            },
            // connection
            C: {
                // remote_addr
                a: req.ip,
                // sessionID
                s: req.sessionID || '',
                // response_time
                t: res.responseTime,
            },
            // input(request)
            I: {
                // user_agent
                a: req.headers['user-agent'] || '',
                // body
                b: req.body || {},
                // files
                f: Object.keys(req.files || {}),
                // method
                m: req.method,
                // query
                q: req.query,
                // referrer
                r: req.headers.referer || req.headers.referrer || '',
                // url
                u: url,
                // http_version
                v: req.httpVersionMajor + '.' + req.httpVersionMinor,
            },
            // output(response)
            O: {
                // error.message
                e: error_message,
                // error_cause.message
                ec: error_cause_message,
                // error.stack
                es: error_stack,
                // error.code
                c: error_code,
                // error.ignorable
                i: error_ignorable,
                // content_length
                l: (res.__headers && res.__headers['Content-Length']) || '-',
                // result
                r: res.result_for_logging || res.result,
                // status
                s: res.__statusCode || res.statusCode,
            },
        };
    };
    const handler = (req, res, next) => {
        // mount safety
        if (req._logging) {
            return next();
        }
        const start = Date.now();
        const writeHead = res.writeHead;
        // flag as logging
        req._logging = true;
        res.writeHead = (code, headers) => {
            res.writeHead = writeHead;
            res.writeHead(code, headers);
            res.__statusCode = code;
            res.__headers = headers || {};
        };
        (0, on_finished_1.default)(res, () => {
            res.responseTime = Date.now() - start;
            // status code response level handling
            let level = log4js_1.default.levels.INFO;
            if (res.statusCode >= 300) {
                level = log4js_1.default.levels.WARN;
            }
            if (res.statusCode >= 400) {
                level = log4js_1.default.levels.ERROR;
            }
            const line = format(req, res);
            if (line) {
                return logger.log(level, line);
            }
        });
        return next();
    };
    return handler;
};
