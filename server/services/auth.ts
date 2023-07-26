import { UserPasswordSchema, UserSchema } from 'models/user';
import Password from 'services/password';
import Users from 'repositories/users';
import jwt from 'services/jwt';
import { z } from 'zod';

/**
 * This service handles user authorization.
 */
const Auth = {

  /**
   * Login with email and password.
   * Returns authorization tokens.
   */
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

  /**
   * Verifies authorization tokesn and returns user id on success.
   * Returns undefined on failure.
   */
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