jsonp_regexp = /^\/api\/\d+p/

exports.install = (response) ->
  response.sendResult = (status, obj, for_logging) ->
    if typeof status isnt 'number'
      for_logging = obj
      obj = status
      status = 200
    @result = for_logging or obj
    if jsonp_regexp.test @req.path
      obj.status = status
      @status status
      .jsonp obj
    else
      @type 'application/json; charset=utf-8'
      .status status
      .json obj

  response.setError = (error, cause) ->
    if not (error instanceof Error)
      error = @_errors[error] or new Error error
    if cause
      error.cause = if cause instanceof Error
        cause
      else
        new Error(cause)
    return @error = error

  response.sendError = (status, error, cause) ->
    if typeof status isnt 'number'
      cause = error
      error = status
      status = 400
    error = @setError error, cause
    description = error._table and (error._table[@req.session.language] or error._table.en)
    if jsonp_regexp.test @req.path
      @status status
      .jsonp status: status, error: error.message, description: description
    else
      @type 'application/json; charset=utf-8'
      .status status
      .json error: error.message, description: description
