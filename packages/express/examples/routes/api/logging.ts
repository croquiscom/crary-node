import { Router } from '../../..';

export default (router: Router) => {
  // 클라이언트에 보내는 데이터와 로깅 데이터를 다르게 주는 예제
  // $ curl -X POST http://localhost:3000/api/logging -d items=1 -d items=2 -d items=3
  router.post('/logging', (req, res) => {
    res.sendResult(req.body.items, { items_length: req.body.items.length });
  });
};
