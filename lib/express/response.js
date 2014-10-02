// Generated by CoffeeScript 1.8.0
(function() {
  var jsonp_regexp;

  jsonp_regexp = /^\/api\/\d+p/;

  exports.install = function(response) {
    response.sendResult = function(status, obj, for_logging) {
      if (typeof status !== 'number') {
        for_logging = obj;
        obj = status;
        status = 200;
      }
      this.result = for_logging || obj;
      if (jsonp_regexp.test(this.req.path)) {
        obj.status = status;
        return this.status(status).jsonp(obj);
      } else {
        return this.type('application/json; charset=utf-8').status(status).json(obj);
      }
    };
    response.setError = function(error, cause) {
      if (!(error instanceof Error)) {
        error = this._errors[error] || new Error(error);
      }
      if (cause) {
        error.cause = cause instanceof Error ? cause : new Error(cause);
      }
      return this.error = error;
    };
    return response.sendError = function(status, error, cause) {
      var description;
      if (typeof status !== 'number') {
        cause = error;
        error = status;
        status = 400;
      }
      error = this.setError(error, cause);
      description = error._table && (error._table[this.req.session.language] || error._table.en);
      if (jsonp_regexp.test(this.req.path)) {
        return this.status(status).jsonp({
          status: status,
          error: error.message,
          description: description
        });
      } else {
        return this.type('application/json; charset=utf-8').status(status).json({
          error: error.message,
          description: description
        });
      }
    };
  };

}).call(this);