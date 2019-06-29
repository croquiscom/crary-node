import { Router } from '../../..';

import routes_hello from './hello';
import routes_logging from './logging';
import routes_promise from './promise';

export default (router: Router) => {
  routes_hello(router);
  routes_logging(router);
  routes_promise(router);
};
