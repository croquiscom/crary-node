import { RequestHandler, Router } from '../../..';

const checkItemsLength: RequestHandler = (req, res, next) => {
  if (req.body.items.length < 3) {
    res.sendError(new Error('too little items'));
  } else {
    next();
  }
};

async function processItems(items: Array<number | string>) {
  return await Promise.all(items.map((item) => Number(item) * 5));
}

export default (router: Router) => {
  // Promise 테스트
  // $ curl -X POST http://localhost:3000/api/promise -d items=1 -d items=2
  // $ curl -X POST http://localhost:3000/api/promise -d items=1 -d items=2 -d items=3
  router.postPromise('/promise', checkItemsLength, async (req, res) => {
    const items = await processItems(req.body.items);
    res.result_for_logging = { items_length: items.length };
    return items;
  });
};
