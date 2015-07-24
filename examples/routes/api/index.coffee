fs = require 'fs'

module.exports = (router) ->
  for file in fs.readdirSync __dirname
    if /\.coffee$/.test(file) and file isnt 'index.coffee'
      require('./'+file)(router)
