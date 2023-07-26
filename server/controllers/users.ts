import { UserIdSchema, UserSchema, UserSchemaWithShapeAndPassword, UserShape } from 'models/user';
import Action from 'framework/action';
import { Controller } from 'framework/controller';
import { NotFoundError } from 'framework/errors';
import Users from 'repositories/users';
import { z } from 'zod';

export default Controller('/users', {

  /**
   * Returns a list of all users
   */
  index: Action.get(
    {
      summary: 'Get all users',
      output: z.array(UserSchema).describe('List of all users'),
    },
    Users.all,
  ),

  /**
   * Returns user by ID
   */
  getById: Action.get(
    {
      summary: 'Get users by id',
      route: '/:id',
      params: { id: UserIdSchema },
      output: UserSchema,
    },
    async (userId, { id }) => {
      const user = await Users.getById(id);
      if (user === null) {
        throw NotFoundError('User not found');
      }
      return user;
    },
  ),

  /**
   * Updates user by ID. All fields are required.
   */
  update: Action.put(
    {
      summary: 'Update user',
      route: '/:id',
      params: { id: UserIdSchema },
      body: UserShape,
      output: UserSchema,
    },
    async (userId, { id, ...userData }) => {
      await Users.updateById(id, userData);

      const user = await Users.getById(id);
      if (user === null) {
        throw NotFoundError('User not found');
      }
      return user;
    },
  ),

  /**
   * Patches user by ID.
   * Only fields that needs to be updated can be sent.
   */
  patch: Action.patch(
    {
      summary: 'Partially update user',
      route: '/:id',
      params: { id: UserIdSchema },
      body: z.object(UserShape).partial().shape,
      output: UserSchema,
    },
    async (userId, { id, ...userData }) => {
      await Users.updateById(id, userData);

      const user = await Users.getById(id);
      if (user === null) {
        throw NotFoundError('User not found');
      }
      return user;
    },
  ),

  /**
   * Creates new user.
   */
  create: Action.post(
    {
      summary: 'Create user',
      body: UserSchemaWithShapeAndPassword.shape,
      output: UserSchema,
    },
    async (userId, data) => {
      const id = await Users.create(data);

      const user = await Users.getById(id);
      if (user === null) {
        throw NotFoundError('User not found');
      }
      return user;
    },
  ),

  /**
   * Deletes user by ID
   */
  delete: Action.delete(
    {
      summary: 'Delete user',
      route: '/:id',
      params: { id: UserIdSchema },
    },
    async (userId, { id }) => await Users.deleteById(id),
  ),

});
