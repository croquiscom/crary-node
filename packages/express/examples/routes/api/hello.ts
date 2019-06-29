import { Router } from '../../..';

export default (router: Router) => {
  // $ curl http://localhost:3000/api/hello
  router.get('/hello', (req, res) => {
    res.sendResult({ msg: 'hello' });
  });
};
