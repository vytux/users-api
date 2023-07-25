import Action from 'framework/action';
import { Controller } from 'framework/controller';
import { JWTSchema } from 'services/jwt';
import { UserSchema } from 'user/types';
import { z } from 'zod';

export default Controller('/auth', {

  index: Action.post(
    {
      isPublic: true,
      summary: 'Authenticate',
      body: {
        email: UserSchema.shape.email,
        password: UserSchema.shape.password,
      },
      output: z.object({ token: JWTSchema, refreshToken: JWTSchema })
        .describe('Authentication tokens'),
    },
    () => {
      return {
        token: 'one',
        refreshToken: 'two',
      };
    },
  ),

  refresh: Action.post(
    {
      isPublic: true,
      summary: 'Refresh authentication token',
      route: '/refresh',
      body: { refreshToken: JWTSchema },
      output: JWTSchema,
    },
    ({ refreshToken }) => {
      return `new ${refreshToken}`;
    },
  ),

});
