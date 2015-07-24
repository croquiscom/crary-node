Promise = require 'bluebird'

processItems = (items) ->
  Promise.resolve items
  .map (item) ->
    item * 5

module.exports = (router) ->
  # Promise 테스트
  # $ curl -X POST http://localhost:3000/api/promise -d items=1 -d items=2 -d items=3
  router.postPromise '/promise', (req, res) ->
    processItems req.body.items
    .tap (items) ->
      res.result_for_logging = items_length: items.length
