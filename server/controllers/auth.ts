import { Controller } from 'framework/controller';
import { actionPost } from 'framework/action';
import { z } from 'zod';

const JWTSchema = z.string().describe('JWT');

export default Controller('/auth', {

  index: actionPost(
    {
      summary: 'Authenticate',
      body: {
        username: z.string(),
        password: z.string(),
      },
      output: z.object({ token: JWTSchema, refreshToken: JWTSchema }),
    },
    ({ username, password }) => {
      return {
        token: 'one',
        refreshToken: 'two',
      };
    },
  ),

  refresh: actionPost(
    {
      summary: 'Refresh authentification token',
      route: '/refresh',
      headers: { refreshToken: JWTSchema },
      output: JWTSchema,
    },
    ({ refreshToken }) => {
      return `new ${refreshToken}`;
    },
  )

});
