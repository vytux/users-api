import {
  UserIdSchema,
  UserPasswordSchema,
  UserSchema,
  UserSchemaWithShapeAndPassword,
  UserShape,
  userFieldTypes
} from 'models/user';
import { databaseFields, databaseInsert, databaseQuery, databaseUpdateById } from 'services/database';
import config from 'config';
import { encryptPassword } from 'services/password';
import { z } from 'zod';

const userFields = Object.keys(UserSchema.shape);

const Users = {
  all: async () => {
    const { rows } = await databaseQuery(
      `SELECT ${databaseFields(userFields)} FROM "public"."users" ORDER BY "createdAt"`,
    );
    return rows.map(data => UserSchema.parse(data));
  },

  getById: async (id: z.infer<typeof UserIdSchema>) => {
    const { rows } = await databaseQuery(
      `SELECT ${databaseFields(userFields)} FROM "public"."users" WHERE id = $1::${userFieldTypes.id}`,
      [id]
    );

    if (!rows.length) return null;
    return UserSchema.parse(rows[0]);
  },

  create: async (
    data: z.infer<ReturnType<typeof z.object<typeof UserSchemaWithShapeAndPassword.shape>>>,
  ) => {
    // Encrypt new password
    data.password = await encryptPassword(data.password, config.PASSWORD_SALT_ROUNDS);
    return databaseInsert(
      'users',
      { ...UserShape, password: UserPasswordSchema },
      data,
      userFieldTypes
    );
  },

  updateById: async (
    id: z.infer<typeof UserIdSchema>,
    data: z.infer<ReturnType<ReturnType<typeof z.object<typeof UserShape>>['partial']>>,
  ) => databaseUpdateById(
    'users',
    UserShape,
    id,
    data,
    userFieldTypes
  ),

  deleteById: async (id: z.infer<typeof UserIdSchema>) => {
    await databaseQuery(
      `DELETE FROM "public"."users" WHERE id = $1::${userFieldTypes.id}`,
      [id],
    );
  },
} as const;

export default Users;