import { UserIdSchema, UserSchema, UserSchemaWithShapeAndPassword, UserShape } from 'models/user';
import Action from 'framework/action';
import { Controller } from 'framework/controller';
import { NotFoundError } from 'framework/errors';
import Users from 'repositories/users';
import { z } from 'zod';

export default Controller('/users', {

  index: Action.get(
    {
      summary: 'Get all users',
      output: z.array(UserSchema).describe('List of all users'),
    },
    Users.all,
  ),

  getById: Action.get(
    {
      summary: 'Get users by id',
      route: '/:id',
      params: { id: UserIdSchema },
      output: UserSchema,
    },
    async ({ id }) => {
      const user = await Users.getById(id);
      if (user === null) {
        throw NotFoundError('User not found');
      }
      return user;
    },
  ),

  update: Action.put(
    {
      summary: 'Update user',
      route: '/:id',
      params: { id: UserIdSchema },
      body: UserShape,
      output: UserSchema,
    },
    async ({ id, ...userData }) => {
      await Users.updateById(id, userData);

      const user = await Users.getById(id);
      if (user === null) {
        throw NotFoundError('User not found');
      }
      return user;
    },
  ),

  patch: Action.patch(
    {
      summary: 'Partially update user',
      route: '/:id',
      params: { id: UserIdSchema },
      body: z.object(UserShape).partial().shape,
      output: UserSchema,
    },
    async ({ id, ...userData }) => {
      await Users.updateById(id, userData);

      const user = await Users.getById(id);
      if (user === null) {
        throw NotFoundError('User not found');
      }
      return user;
    },
  ),

  create: Action.post(
    {
      summary: 'Create user',
      body: UserSchemaWithShapeAndPassword.shape,
      output: UserSchema,
    },
    async (data) => {
      const id = await Users.create(data);

      const user = await Users.getById(id);
      if (user === null) {
        throw NotFoundError('User not found');
      }
      return user;
    },
  ),

  delete: Action.delete(
    {
      summary: 'Delete user',
      route: '/:id',
      params: { id: UserIdSchema },
    },
    async ({ id }) => await Users.deleteById(id),
  ),

});
