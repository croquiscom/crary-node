express = require 'express'

setupMiddlewares = (app, config) ->
  bodyParser = require 'body-parser'
  app.use require('compression')()
  app.use require('connect-decompress')()
  app.use bodyParser.json()
  app.use bodyParser.urlencoded extended: true
  app.use require('cookie-parser')()
  return

setupSession = (app, config) ->
  session = require 'express-session'
  redis = require 'redis'
  RedisStore = require('connect-redis') session
  redis_client = redis.createClient config.redis_port
  sessionStore = new RedisStore client: redis_client, ttl: config.session_ttl
  sessionStore.on 'disconnect', ->
    console.log "RedisStore for express is disconnected. Exit the process..."
    setTimeout ->
      process.exit 0
      return
    , 1000
    return
  app.use session
    store: sessionStore
    secret: config.session_secret
    cookie: maxAge: config.session_ttl*1000
    saveUninitialized: false
    resave: true # session expire를 초기로 돌리기 위해서 매번 다시 저장한다
  return

setupRouters = (app, config) ->
  for path, ctor of config.routers
    router = express.Router()
    ctor router, app
    if path
      app.use path, router
    else
      app.use router
  return

setupErrorHandler = (app, config) ->
  app.use (err, req, res, next) ->
    if not (err instanceof Error)
      err = new Error err
    res.error = err
    code = err.status or res.statusCode
    if code < 400
      code = 500
    res.type 'application/json; charset=utf-8'
    .status code
    .json error: err.message
    return
  return

module.exports = (config) ->
  app = express()

  app.set 'trust proxy', true

  if config.log4js_config
    app.use require('./logger') config

  setupMiddlewares app, config
  setupSession app, config
  setupRouters app, config
  setupErrorHandler app, config

  app.response._errors = config.errors or {}
  require('./response').install app.response

  return app
