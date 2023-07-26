import { UserPasswordSchema, UserShape } from 'models/user';
import jwt, { JWTSchema } from 'services/jwt';
import Action from 'framework/action';
import Auth from 'services/auth';
import { Controller } from 'framework/controller';
import { InvalidTokenError } from 'framework/errors';
import { z } from 'zod';

export default Controller('/auth', {

  index: Action.publicPost(
    {
      summary: 'Authenticate',
      body: {
        email: UserShape.email,
        password: UserPasswordSchema,
      },
      output: z.object({ accessToken: JWTSchema, refreshToken: JWTSchema })
        .describe('Authentication tokens'),
    },
    async (userId, { email, password }) => {
      const tokens = await Auth.auth(email, password);
      if (!tokens) {
        throw new z.ZodError([{
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'User not found',
        }]);
      }
      return tokens;
    },
  ),

  refresh: Action.publicPost(
    {
      summary: 'Refresh authentication token',
      route: '/refresh',
      body: { refreshToken: JWTSchema },
      output: z.object({ accessToken: JWTSchema, refreshToken: JWTSchema })
        .describe('Authentication tokens'),
    },
    async (userId, { refreshToken }) => {
      try {
        return await jwt.refreshTokens(refreshToken);
      } catch (error) {
        throw InvalidTokenError();
      }
    }
  ),

});
