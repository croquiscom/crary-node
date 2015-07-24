routes_root = (router) ->
  router.all '*', (req, res) ->
    res.sendError 404, new Error 'missing api'

module.exports =
  '/api': require './api'
  '': routes_root
