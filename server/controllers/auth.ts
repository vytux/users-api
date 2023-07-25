import Action from 'framework/action';
import { Controller } from 'framework/controller';
import { UserSchema } from 'user/types';
import { z } from 'zod';

const JWTSchema = z.string().describe('JWT');

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
        .describe('Authentification tokens'),
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
      summary: 'Refresh authentification token',
      route: '/refresh',
      body: { refreshToken: JWTSchema },
      output: JWTSchema,
    },
    ({ refreshToken }) => {
      return `new ${refreshToken}`;
    },
  ),

});
