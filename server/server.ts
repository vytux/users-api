import config from 'config';
import { server } from 'framework/server';

server({
  port: config.HTTP_PORT,
  host: config.HTTP_HOST,
  logger: true,
}).then(({ start }) => start(({ log }, err) => {
  if (err) {
    log.error(err);
    process.exit(1);
  }
}));
