import { encryptPassword, verifyPassword } from 'services/password';
import config from 'config';
import expect from 'expect';

describe('password', () => {
  it('encrypts and verifies password ', async () => {
    const password = 'my-very-secure-password';

    const encrypted = await encryptPassword(password, config.PASSWORD_SALT_ROUNDS);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBe(60);

    const verifyInvalid = await verifyPassword('invalid-password', encrypted);
    expect(verifyInvalid).toBeFalsy();

    const verifyValid = await verifyPassword(password, encrypted);
    expect(verifyValid).toBeTruthy();
  });
});
