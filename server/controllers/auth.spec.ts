import { address, defaultTestUser } from 'test-const';
import auth from 'controllers/auth';
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
    expect(typeof response.body.accessToken).toBe('string');
    expect(typeof response.body.refreshToken).toBe('string');
  });

  it('fails authentication with invalid credentials', async () => {
    const response = await request(address)
      .post(auth.index.route)
      .send({ email: 'some@random.com', password: 'very-random-password' });

    expect(response.status).toBe(400);
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
    expect(typeof refreshResponse.body.accessToken).toBe('string');
    expect(typeof refreshResponse.body.refreshToken).toBe('string');
  });

  it('fails to refresh token with invalid refresh token', async () => {
    const refreshResponse = await request(address)
      .post(auth.refresh.route)
      .send({ refreshToken: 'some token' });

    expect(refreshResponse.status).toBe(400);
  });
});
