import { FieldTypes } from 'services/database';
import { z } from 'zod';

export const UserIdSchema = z.string()
  .nonempty()
  .uuid()
  .describe('User ID');

export const UserPasswordSchema = z.string()
  .nonempty()
  .min(8)
  .max(64)
  .describe('User Password');

export const UserTimestampsShape = {
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
};

export const UserShape = {
  name: z.string().nonempty().describe('Full name'),
  email: z.string().nonempty().email().max(64).describe('Email address'),
};

export const UserSchema = z.object({
  id: UserIdSchema,
  ...UserShape,
  ...UserTimestampsShape,
}).describe('User');

export const UserSchemaWithShapeAndPassword = z.object({
  ...UserShape,
  password: UserPasswordSchema,
});

export const userFieldTypes: FieldTypes<typeof UserSchema.shape & { password: typeof UserPasswordSchema }> = {
  id: 'uuid',
  name: 'text',
  email: 'citext',
  password: 'text',
  updatedAt: 'timestamp',
  createdAt: 'timestamp',
} as const;
