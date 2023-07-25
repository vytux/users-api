import auth from 'controllers/auth';
import config from 'config';
import { server } from 'framework/server';
import users from 'controllers/users';

server({
  // HTTP server configuration
  port: config.HTTP_PORT,
  host: config.HTTP_HOST,

  // Enable / disable logging
  logger: true,

  // Documentation URL
  documentationRoute: '/documentation',

  // OpenAPI configuration
  openapi: {
    info: {
      title: 'Users API',
      description: 'Backend service for creating, editing and deleting users',
      version: '1.0.0',
    },
  },

  // Every controller in this list will be accessible through api
  controllers: {
    auth,
    users,
  },
}).then(({ start }) => start(({ log }, err) => {
  if (err) {
    log.error(err);
    process.exit(1);
  }
}));
