import http from 'http';
import { createApp } from '..';
import routes from './routes';

const app = createApp({
  log4js_config: {
    appenders: {
      console: {
        type: 'console',
      },
    },
    categories: {
      default: {
        appenders: ['console'],
        level: 'info',
      },
    },
  },
  project_root: __dirname,
  routers: routes,
  session: {
    secret: 'secret',
    ttl: 360,
  },
});

const server = http.createServer(app);

server.listen(3000, () => {
  console.log('Server started');
});
