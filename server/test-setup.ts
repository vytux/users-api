import { databaseDisconnect, databaseQuery } from 'services/database';
import config from 'config';
import { defaultTestUser } from 'test-const';
import { encryptPassword } from 'services/password';
import { join } from 'path';
import { readFileSync } from 'fs';
import server from 'server';

let stop: () => void;

before(async () => {
  // Re-create database schema
  const schema = readFileSync(join(__dirname, 'schema.sql')).toString();
  await databaseQuery(schema);

  // Create test user
  await databaseQuery(
    'INSERT INTO "public"."users" ("name", "email", "password") VALUES ($1::text, $2::citext, $3::text);',
    [
      defaultTestUser.name,
      defaultTestUser.email,
      await encryptPassword(defaultTestUser.password, config.PASSWORD_SALT_ROUNDS),
    ],
  );

  // Start http server
  const result = await server();
  stop = result.stop;
  await new Promise((resolve) => result.start(resolve));
});

after(async () => {
  // Stop http server
  await stop();
  await databaseDisconnect();
});
