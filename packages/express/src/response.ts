import express from 'express';

export function install(response: express.Response) {
  response.sendResult = function(status: number | object, obj: object, for_logging?: object) {
    if (typeof status !== 'number') {
      for_logging = obj;
      obj = status;
      status = this.statusCode || 200;
    }
    this.result = for_logging || obj;
    this.type('application/json; charset=utf-8').status(status).json(obj);
  };

  response.setError = function(error: Error, cause?: Error) {
    if (!(error instanceof Error)) {
      error = this._errors[error] || new Error(error);
    }
    if (cause) {
      (error as any).cause = cause instanceof Error ? cause : new Error(cause);
    }
    this.error = error;
    return error;
  };

  response.sendError = function(status: number | Error, error: Error, cause?: Error) {
    if (typeof status !== 'number') {
      cause = error;
      error = status;
      status = this.statusCode === 200 ? 400 : this.statusCode;
    }
    error = this.setError(error, cause);
    const table = (error as any)._table;
    const session = (this as any).req.session;
    const description = table && table[session && session.language || 'en'];
    return this.type('application/json; charset=utf-8').status(status).json({
      description,
      error: error.message,
    });
  };
}
