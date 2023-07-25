import auth from 'controllers/auth';
import config from 'config';
import { server } from 'framework/server';
import users from 'controllers/users';

export const address = `http://${config.HTTP_HOST}:${config.HTTP_PORT}`;

export default (options?: Parameters<typeof server>[0]) => server({
  // HTTP server configuration
  port: config.HTTP_PORT,
  host: config.HTTP_HOST,

  // Enable / disable logging
  logger: config.HTTP_LOG,

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

  // Inject options from the outside
  ...(options ?? {}),
});
