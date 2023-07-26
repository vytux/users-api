import bcrypt from 'bcrypt';

const Password = {

  encrypt: async (password: string, saltRounds: number) =>
    await bcrypt.hash(password, saltRounds),

  verify: async (password: string, encrypted: string) =>
    await bcrypt.compare(password, encrypted),

};

export default Password;