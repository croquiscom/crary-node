crary = require '../'
http = require 'http'

app = crary.express.createApp
  project_root: __dirname
  log4js_config:
    appenders: [ {
      type: 'console'
    } ]
  session_secret: 'secret'
  routers: require './routes'
server = http.createServer app
server.listen 3000, ->
  console.log 'Server started'
