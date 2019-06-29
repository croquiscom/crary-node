import { Router } from '../..';

import routes_api from './api';

function routes_root(router: Router) {
  router.all('*', (req, res) => {
    res.sendError(404, new Error('missing api'));
  });
}

export default {
  '/api': routes_api,
  // tslint:disable-next-line:object-literal-sort-keys
  '': routes_root,
};
