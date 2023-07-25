import jwt, { SignOptions } from 'jsonwebtoken';
import { UserShape } from 'user/types';
import config from 'config';
import { z } from 'zod';

/**
 * Authentication token data
 */
const JWTDataShape = {
  id: UserShape.id,
};
export const JWTDataSchema = z.object({
  ...JWTDataShape,
  tokenType: z.literal('access'),
  refreshCount: z.number().gte(0).describe('How many times the token has been refreshed'),
});

/**
 * Refresh token data
 */
export const RefreshJWTDataSchema = z.object({
  ...JWTDataSchema.shape,
  tokenType: z.literal('refresh'),
});


export const JWTSchema = z.string().describe('JWT');

export const createJWT = (data: object, options?: SignOptions) =>
  jwt.sign(data, config.JWT_PRIVATE_KEY, { ...options, algorithm: 'RS512' });

export const verifyJWT = <T>(token: string): T =>
  jwt.verify(token, config.JWT_PUBLIC_KEY) as T;

/**
 * Creates new access and refresh token pair
 */
export const createTokens = (
  userData: z.infer<ReturnType<typeof z.object<typeof JWTDataShape>>>,
  refreshCount = 0
) => {
  // Parse given data first to make sure no invalid data slips through into the token
  const data = JWTDataSchema.parse({ ...userData, tokenType: 'access', refreshCount });
  const refreshData = RefreshJWTDataSchema.parse({ ...userData, tokenType: 'refresh', refreshCount });

  const accessToken = createJWT(data, { expiresIn: '15min' });
  const refreshToken = createJWT(refreshData, { expiresIn: '1h' });

  return { accessToken, refreshToken };
}

/**
 * Verifies if given access token is valid and returns data contained inside
 */
export const verifyToken = (accessToken: string) => {
  // Verify access token, validate contents schema and remove unknown properties
  return JWTDataSchema.parse(
    verifyJWT<z.infer<typeof RefreshJWTDataSchema>>(accessToken),
  );
}

/**
 * Generates new access and refresh token pair from a given valid refresh token
 */
export const refreshTokens = (refreshToken: string) => {
  // Verify refresh token, validate contents schema and remove unknown properties
  const data = RefreshJWTDataSchema.parse(
    verifyJWT<z.infer<typeof RefreshJWTDataSchema>>(refreshToken),
  );

  // Create new access and refresh token pair
  return createTokens(data, data.refreshCount + 1);
}
