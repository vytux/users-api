import Authorization from 'services/auth';
import auth from 'controllers/auth';
import config from 'config';
import { server } from 'framework/server';
import users from 'controllers/users';

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
    openapi: '3.0.0',
    info: {
      title: 'Users API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  // Every controller in this list will be accessible through api
  controllers: {
    auth,
    users,
  },

  // Authorization settings
  authValidator: async (token) => {
    if (!token || !token.startsWith('Bearer ')) {
      return;
    }
    const jwtToken = token.substring('Bearer '.length).trim();
    return await Authorization.verify(jwtToken);
  },

  // Inject options from the outside
  ...(options ?? {}),
});
