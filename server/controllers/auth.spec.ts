import { address } from 'server';
import auth from 'controllers/auth';
import { defaultTestUser } from 'test-const';
import { expect } from 'expect';
import request from 'supertest';

describe('auth', () => {
  const authData = {
    email: defaultTestUser.email,
    password: defaultTestUser.password
  } as const;

  it('returns authentication token', async () => {
    const response = await request(address)
      .post(auth.index.route)
      .send(authData);

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
  });

  it('refreshes authentication token', async () => {
    const authResponse = await request(address)
      .post(auth.index.route)
      .send(authData);

    expect(authResponse.status).toBe(200);
    expect(typeof authResponse.body.refreshToken).toBe('string');

    const refreshResponse = await request(address)
      .post(auth.refresh.route)
      .send({ refreshToken: authResponse.body.refreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(typeof refreshResponse.text).toBe('string');
  });
});
