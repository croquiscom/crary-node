module.exports = (config) ->
  log4js = require 'log4js'
  log4js.configure config.log4js_config

  logger = log4js.getLogger 'express'

  project_root = config.project_root + '/'

  format = (req, res) ->
    if req.skip_logging
      return ''

    if e = res.error
      error_message = e._code or e.message
      if not e._code and stack = e.stack
        stack = stack.substr stack.indexOf('\n')+1
        if (pos = stack.indexOf('response.setError')) >= 0
          stack = stack.substr stack.indexOf('\n', pos)+1
        error_stack = stack.split('\n', 3).map (line) -> line.replace(project_root, '').trim()
      if e = e.cause
        error_cause_message = e.message
    url = req.originalUrl
    if (pos = url.indexOf('?')) >= 0
      url = url.substr 0, pos
    if url[url.length-1] is '/'
      url = url.substr 0, url.length-1
    return {
      inspect: ->
        msg = "<#{@C.s.substr 0, 6}> [#{@C.t}ms] #{@C.a} - - \"#{@I.m} #{@I.u} HTTP/#{@I.v}\" #{@O.s} #{@O.l} \"#{@I.r}\" \"#{@I.a}\""
        msg += "\n\tI] q: #{JSON.stringify @I.q}, b: #{JSON.stringify @I.b}, f: #{JSON.stringify @I.f}"
        if @O.r
          msg += "\n\tO] #{JSON.stringify @O.r}"
        if @O.e
          msg += "\n\tE] #{@O.e}"
          if @O.ec
            msg += " CAUSED BY #{@O.ec}"
          if @O.es
            msg += @O.es.map((line) -> '\n\t' + line).join('')
        return msg
      # connection
      C:
        # sessionID
        s: req.sessionID or ''
        # response_time
        t: res.responseTime
        # remote_addr
        a: req.ip
      # input(request)
      I:
        # method
        m: req.method
        # url
        u: url
        # http_version
        v: req.httpVersionMajor + '.' + req.httpVersionMinor
        # referrer
        r: req.headers['referer'] or req.headers['referrer'] or ''
        # user_agent
        a: req.headers['user-agent'] or ''
        # query
        q: req.query or {}
        # body
        b: req.body or {}
        # files
        f: Object.keys req.files or {}
      # output(response)
      O:
        # status
        s: res.__statusCode or res.statusCode
        # content_length
        l: (res._headers and res._headers['content-length']) or (res.__headers and res.__headers['Content-Length']) or '-'
        # error.message
        e: error_message
        # error.stack
        es: error_stack
        # error_cause.message
        ec: error_cause_message
        # result
        r: res.result
    }

  log4js.connectLogger logger, format: format, level: 'auto'
