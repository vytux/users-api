import { databaseDisconnect, databaseQuery } from 'services/database';
import Password from 'services/password';
import config from 'config';
import { defaultTestUser } from 'test-const';
import { join } from 'path';
import { readFileSync } from 'fs';
import server from 'server';

const schema = readFileSync(join(__dirname, 'schema.sql')).toString();

let stop: () => void;

before(async () => {
  // Seed database
  await databaseQuery(schema);

  // Create test user
  await databaseQuery(
    'INSERT INTO "users" ("name", "email", "password") VALUES ($1::text, $2::citext, $3::text);',
    [
      defaultTestUser.name,
      defaultTestUser.email,
      await Password.encrypt(defaultTestUser.password, config.PASSWORD_SALT_ROUNDS),
    ],
  );

  // Start http server
  const serverInstance = await server();
  stop = serverInstance.stop;

  // Wait for the server to start before continuing
  await new Promise((resolve) => serverInstance.start(resolve));
});

after(async () => {
  // Stop http server
  await stop();
  await databaseDisconnect();
});
