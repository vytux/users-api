import bcrypt from 'bcrypt';

export const encryptPassword = async (password: string, saltRounds: number) =>
  await bcrypt.hash(password, saltRounds);

export const verifyPassword = async (password: string, encrypted: string) =>
  await bcrypt.compare(password, encrypted);
