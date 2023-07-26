import {
  User,
  UserIdSchema,
  UserPasswordSchema,
  UserSchema,
  UserSchemaWithShapeAndPassword,
  UserShape,
  userFieldTypes
} from 'models/user';
import { databaseFields, databaseInsert, databaseQuery, databaseUpdateById } from 'services/database';
import Password from 'services/password';
import config from 'config';
import { z } from 'zod';

const userFields = Object.keys(UserSchema.shape);

const Users = {

  /**
   * Returns all users
   */
  all: async () => {
    const { rows } = await databaseQuery(
      `SELECT ${databaseFields(userFields)} FROM "users" ORDER BY "createdAt"`,
    );
    return rows.map(data => UserSchema.parse(data));
  },

  getById: async (id: z.infer<typeof UserIdSchema>) => {
    const { rows } = await databaseQuery(
      `SELECT ${databaseFields(userFields)} FROM "users" WHERE "id" = $1::${userFieldTypes.id}`,
      [id]
    );

    if (!rows.length) return null;
    return UserSchema.parse(rows[0]);
  },

  getIdAndPasswordByEmail: async (
    email: z.infer<typeof UserSchema.shape.email>,
  ): Promise<{
    id: z.infer<typeof UserPasswordSchema>,
    password: z.infer<typeof UserPasswordSchema>,
  } | null> => {
    const { rows } = await databaseQuery(
      `SELECT "id", "password" FROM "users" WHERE "email" = $1::${userFieldTypes.email}`,
      [email]
    );

    if (!rows.length) return null;
    return rows[0];
  },

  create: async (
    data: z.infer<typeof UserSchemaWithShapeAndPassword>,
  ) => {
    // Encrypt new password
    data.password = await Password.encrypt(data.password, config.PASSWORD_SALT_ROUNDS);
    return databaseInsert(
      'users',
      { ...UserShape, password: UserPasswordSchema },
      data,
      userFieldTypes
    );
  },

  updateById: async (
    id: z.infer<typeof UserIdSchema>,
    data: z.infer<ReturnType<typeof User['partial']>>,
  ) => databaseUpdateById(
    'users',
    UserShape,
    id,
    data,
    userFieldTypes
  ),

  deleteById: async (id: z.infer<typeof UserIdSchema>) => {
    await databaseQuery(
      `DELETE FROM "users" WHERE id = $1::${userFieldTypes.id}`,
      [id],
    );
  },
} as const;

export default Users;