import Password from 'services/password';
import config from 'config';
import expect from 'expect';

describe('password', () => {
  it('encrypts and verifies password ', async () => {
    const password = 'my-very-secure-password';

    const encrypted = await Password.encrypt(password, config.PASSWORD_SALT_ROUNDS);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBe(60);

    const verifyInvalid = await Password.verify('invalid-password', encrypted);
    expect(verifyInvalid).toBeFalsy();

    const verifyValid = await Password.verify(password, encrypted);
    expect(verifyValid).toBeTruthy();
  });
});
