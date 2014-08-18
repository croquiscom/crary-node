express = require 'express'

setupMiddlewares = (app, config) ->
  bodyParser = require 'body-parser'
  app.use require('compression')()
  app.use require('connect-decompress')()
  app.use bodyParser.json()
  app.use bodyParser.urlencoded extended: true
  app.use require('cookie-parser')()

setupSession = (app, config) ->
  session = require 'express-session'
  redis = require 'redis'
  RedisStore = require('connect-redis') session
  redis_client = redis.createClient config.redis_port
  sessionStore = new RedisStore client: redis_client, ttl: config.session_ttl
  sessionStore.on 'disconnect', ->
    console.log "RedisStore for express is disconnected. Exit the process..."
    setTimeout (-> process.exit 0), 1000
  app.use session
    store: sessionStore
    secret: config.session_secret
    cookie: maxAge: config.session_ttl*1000
    saveUninitialized: false
    resave: true # session expire를 초기로 돌리기 위해서 매번 다시 저장한다

module.exports = (config) ->
  app = express()

  app.set 'trust proxy', true

  if config.log4js_config
    app.use require('./logger') config

  setupMiddlewares app, config
  setupSession app, config

  return app
