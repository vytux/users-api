import bcrypt from 'bcrypt';

const Password = {

  /**
   * Encrypts given password and returns encrypted value.
   */
  encrypt: async (password: string, saltRounds: number) =>
    await bcrypt.hash(password, saltRounds),

  /**
   * Verifies if unencrypted and encrypted passwords are the same.
   */
  verify: async (password: string, encrypted: string) =>
    await bcrypt.compare(password, encrypted),

};

export default Password;