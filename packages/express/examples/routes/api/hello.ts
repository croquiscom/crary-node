import { Router } from '../../..';

export default (router: Router) => {
  // $ curl http://localhost:3000/api/hello?name=crary
  router.get('/hello', (req, res) => {
    const name = req.query.name?.toString() || 'world';
    res.sendResult({ msg: `hello ${name}` });
  });
};
