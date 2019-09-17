import express from 'express';
import log4js from 'log4js';
import onFinished from 'on-finished';
import util from 'util';
import { IExpressConfig } from './config';

export default (config: IExpressConfig) => {
  log4js.configure(config.log4js_config!);
  const logger = log4js.getLogger(config.project_name || 'express');
  const project_root = config.project_root + '/';
  const format = (req: express.Request, res: express.Response) => {
    if (req.skip_logging) {
      return '';
    }
    let e = res.error as any;
    let error_message;
    let error_stack;
    let error_cause_message;
    if (e) {
      error_message = e._code || e.message;
      if (!e._code && e.stack) {
        let stack: string = e.stack;
        stack = stack.substr(stack.indexOf('\n') + 1);
        const pos = stack.indexOf('response.setError');
        if (pos >= 0) {
          stack = stack.substr(stack.indexOf('\n', pos) + 1);
        }
        error_stack = stack.split('\n', 3).map((line) => {
          return line.replace(project_root, '').trim();
        });
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
    return {
      [util.inspect.custom]() {
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
            msg += this.O.es.map((line) => {
              return '\n\t' + line;
            }).join('');
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
        q: req.query || {},
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
        // content_length
        l: (res.__headers && res.__headers['Content-Length']) || '-',
        // result
        r: res.result,
        // status
        s: res.__statusCode || res.statusCode,
      },
    };
  };
  const handler: express.RequestHandler = (req, res, next) => {
    // mount safety
    if (req._logging) {
      return next();
    }
    const start = Date.now();
    const writeHead = res.writeHead;
    // flag as logging
    req._logging = true;
    (res as any).writeHead = (code: number, headers: any) => {
      res.writeHead = writeHead;
      res.writeHead(code, headers);
      res.__statusCode = code;
      res.__headers = headers || {};
    };
    onFinished(res, () => {
      res.responseTime = Date.now() - start;
      // status code response level handling
      let level = log4js.levels.INFO;
      if (res.statusCode >= 300) {
        level = log4js.levels.WARN;
      }
      if (res.statusCode >= 400) {
        level = log4js.levels.ERROR;
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
