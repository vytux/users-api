import { address } from 'server';
import { expect } from 'expect';
import request from 'supertest';
import users from 'controllers/users';

describe('users', () => {
  // This test should be split into multiple ones to track bugs easier
  // But it will do for this demo
  it('creates, updates, patches and returns user ', async () => {
    const testUser = {
      name: 'Test user 1',
      email: 'test1@user.com',
      password: 'test1-password',
    } as const;

    /**
     * Create user
     */
    const createResponse = await request(address)
      .post(users.create.route)
      .send(testUser);

    const id = createResponse.body.id;

    expect(createResponse.status).toBe(200);
    expect(typeof id).toBe('string');
    expect(createResponse.body.name).toBe(testUser.name);
    expect(createResponse.body.email).toBe(testUser.email);

    // Password is not returned
    expect(createResponse.body.password).toBe(undefined);


    /**
     * Get user
     */
    const getResponse1 = await request(address)
      .get(users.getById.route.replace(':id', id))
      .send();

    expect(getResponse1.status).toBe(200);
    expect(getResponse1.body.id).toBe(id);
    expect(getResponse1.body.name).toBe(testUser.name);
    expect(getResponse1.body.email).toBe(testUser.email);

    // Password is not returned
    expect(getResponse1.body.password).toBe(undefined);


    /**
     * Patch user
     */
    const newName = 'Test user 2';
    const patchResponse = await request(address)
      .patch(users.patch.route.replace(':id', id))
      .send({ name: newName });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.id).toBe(id);
    expect(patchResponse.body.name).toBe(newName);
    expect(patchResponse.body.email).toBe(testUser.email);

    // Password is not returned
    expect(patchResponse.body.password).toBe(undefined);


    /**
     * Get user 2
     */
    const getResponse2 = await request(address)
      .get(users.getById.route.replace(':id', id))
      .send();

    expect(getResponse2.status).toBe(200);
    expect(getResponse2.body.id).toBe(id);
    expect(getResponse2.body.name).toBe(newName);
    expect(getResponse2.body.email).toBe(testUser.email);

    // Password is not returned
    expect(getResponse2.body.password).toBe(undefined);


    /**
     * Update user
     */
    const updateResponse = await request(address)
      .put(users.update.route.replace(':id', id))
      .send(testUser);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.id).toBe(id);
    expect(updateResponse.body.name).toBe(testUser.name);
    expect(updateResponse.body.email).toBe(testUser.email);

    // Password is not returned
    expect(updateResponse.body.password).toBe(undefined);


    /**
     * Get user 3
     */
    const getResponse3 = await request(address)
      .get(users.getById.route.replace(':id', id))
      .send();

    expect(getResponse3.status).toBe(200);
    expect(getResponse3.body.id).toBe(id);
    expect(getResponse3.body.name).toBe(testUser.name);
    expect(getResponse3.body.email).toBe(testUser.email);

    // Password is not returned
    expect(getResponse3.body.password).toBe(undefined);


    /**
     * Delete user
     */
    const deleteResponse = await request(address)
      .delete(users.delete.route.replace(':id', id))
      .send();

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.text).toBe('OK');


    /**
     * Get user 4
     */
    const getResponse4 = await request(address)
      .get(users.getById.route.replace(':id', id))
      .send();

    expect(getResponse4.status).toBe(404);
  });
});
