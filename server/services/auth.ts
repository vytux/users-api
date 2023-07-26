import { UserPasswordSchema, UserSchema } from 'models/user';
import Password from 'services/password';
import Users from 'repositories/users';
import jwt from 'services/jwt';
import { z } from 'zod';

const Auth = {

  auth: async (
    email: z.infer<typeof UserSchema.shape.email>,
    password: z.infer<typeof UserPasswordSchema>,
  ) => {
    const user = await Users.getIdAndPasswordByEmail(email);
    if (!user) {
      return null;
    }

    if (!await Password.verify(password, user.password)) {
      return null;
    }

    return jwt.createTokens({ id: user.id });
  },

  verify: async (token: string): Promise<string | undefined> => {
    try {
      const result = await jwt.verifyToken(token);
      if (result && result.tokenType === 'access') {
        return result.id;
      }
    } catch (error) {
      // Error verifying token. Just return unauthorized.
      return;
    }
  },

} as const;

export default Auth;