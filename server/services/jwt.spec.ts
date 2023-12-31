import expect from 'expect';
import jwt from 'services/jwt';
import { v4 as uuid } from 'uuid';

describe('jwt', () => {
  it('creates and verifies token ', async () => {
    const data = {
      id: '123',
      text: 'Hello!',
    };

    const token = jwt.create(data);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    const result = jwt.verify<typeof data>(token);
    expect({ id: result.id, text: result.text }).toStrictEqual(data);
  });

  it('creates, verifies and refreshes JWT ', async () => {
    const data = { id: uuid() };

    const { accessToken, refreshToken } = jwt.createTokens(data);

    expect(typeof accessToken).toBe('string');
    expect(accessToken.length).toBeGreaterThan(0);

    expect(typeof refreshToken).toBe('string');
    expect(refreshToken.length).toBeGreaterThan(0);

    const data1 = jwt.verifyToken(accessToken);
    expect(data1).toStrictEqual({ tokenType: 'access', refreshCount: 0, ...data });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = jwt.refreshTokens(refreshToken);

    expect(typeof newAccessToken).toBe('string');
    expect(newAccessToken.length).toBeGreaterThan(0);

    expect(typeof newRefreshToken).toBe('string');
    expect(newRefreshToken.length).toBeGreaterThan(0);

    expect(accessToken === newAccessToken).toBeFalsy();
    expect(refreshToken === newRefreshToken).toBeFalsy();

    const data2 = jwt.verifyToken(newAccessToken);
    expect(data2).toStrictEqual({ tokenType: 'access', refreshCount: 1, ...data });
  });
});
