import bcrypt from 'bcrypt';
import config from 'config';

export const encryptPassword = async (password: string) =>
  await bcrypt.hash(password, config.PASSWORD_SALT_ROUNDS);

export const verifyPassword = async (password: string, encrypted: string) =>
  await bcrypt.compare(password, encrypted);
