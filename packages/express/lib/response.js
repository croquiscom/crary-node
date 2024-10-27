"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = install;
function install(response) {
    response.sendResult = function (status, obj, for_logging) {
        if (typeof status !== 'number') {
            for_logging = obj;
            obj = status;
            status = this.statusCode || 200;
        }
        this.result = for_logging || obj;
        this.type('application/json; charset=utf-8').status(status).json(obj);
    };
    response.setError = function (error, cause) {
        if (!(error instanceof Error)) {
            error = this._errors[error] || new Error(error);
        }
        if (cause) {
            error.cause = cause instanceof Error ? cause : new Error(cause);
        }
        this.error = error;
        return error;
    };
    response.sendError = function (status, error, cause) {
        if (typeof status !== 'number') {
            cause = error;
            error = status;
            status = this.statusCode === 200 ? 400 : this.statusCode;
        }
        error = this.setError(error, cause);
        const table = error._table;
        const session = this.req.session;
        const description = table && table[(session && session.language) || 'en'];
        return this.type('application/json; charset=utf-8').status(status).json({
            description,
            error: error.message,
        });
    };
}
