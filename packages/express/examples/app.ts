import http from 'http';
import path from 'path';
import { createApp } from '..';
import routes from './routes';

const app = createApp({
  log4js_config: {
    appenders: {
      console: {
        layout: { type: 'json' },
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
  project_name: 'examples',
  project_root: path.resolve(__dirname, '..'),
  routers: routes,
  session: {
    secret: 'secret',
    ttl: 360,
  },
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = http.createServer(app);

server.listen(3000, () => {
  console.log('Server started');
});
