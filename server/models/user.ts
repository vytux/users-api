import { FieldTypes } from 'services/database';
import { z } from 'zod';

/**
 * Schema of user ID
 */
export const UserIdSchema = z.string()
  .nonempty()
  .uuid()
  .describe('User ID');

/**
 * Scheme of user's password
 */
export const UserPasswordSchema = z.string()
  .nonempty()
  .min(8)
  .max(64)
  .describe('User Password');

/**
 * User scheme timestamps.
 * Readonly, controlled by the database.
 */
export const UserTimestampsShape = {
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
};

/**
 * Basic user fields.
 * Add new public fields here.
 */
export const UserShape = {
  name: z.string().nonempty().describe('Full name'),
  email: z.string().nonempty().email().max(64).describe('Email address'),
};
export const User = z.object(UserShape);

/**
 * User schema with id, user fields and timestamps.
 * Should be used to return from the API.
 */
export const UserSchema = z.object({
  id: UserIdSchema,
  ...UserShape,
  ...UserTimestampsShape,
}).describe('User');

/**
 * Schema with default user fields and password
 */
export const UserSchemaWithShapeAndPassword = z.object({
  ...UserShape,
  password: UserPasswordSchema,
});

/**
 * Database types of user schema
 */
export const userFieldTypes: FieldTypes<typeof UserSchema.shape & { password: typeof UserPasswordSchema }> = {
  id: 'uuid',
  name: 'text',
  email: 'citext',
  password: 'text',
  updatedAt: 'timestamp',
  createdAt: 'timestamp',
} as const;
