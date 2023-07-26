/* eslint-disable no-console */
import { ErrorMessageOptions, generateErrorMessage } from 'zod-error';
import { UserPasswordSchema, UserShape } from '../server/models/user';
import { confirm, input, password } from '@inquirer/prompts';
import { readFileSync, writeFileSync } from 'fs';
import Password from '../server/services/password';
import Postgres from '../server/services/pgsql';
import { generate } from 'rsa-keypair';
import { join } from 'path';
import { z } from 'zod';

const environments = ['production', 'development', 'test'] as const;
type Environment = typeof environments[number];

// Default http ports to suggest
const defaultHttpPorts = {
  production: 80,
  development: 3000,
  test: 4000,
} as const;

// Default values to suggest for http logging
const defaultHttpLog = {
  production: false,
  development: true,
  test: false,
} as const;

// Default values to suggest for seeding database
const defaultSeedDb = {
  production: true,
  development: true,
  test: false,
} as const;

// Default values to suggest for PostgreSQL
// Updated every time user inputs something
const pgsqlDefaults = {
  pgsqlHost: 'localhost',
  pgsqlPort: 5432,
  pgsqlDatabase: '',
  pgsqlUsername: '',
  pgsqlPassword: '',
}

/**
 * Keeps asking for a value until the value is correctly
 * validated by zod schema
 */
const validateField = async (
  getter: () => Promise<string>,
  schema: z.ZodType,
) => {
  let value = await getter();
  let validation = schema.safeParse(value);
  while (!validation.success) {
    if ('error' in validation) {
      const errorFormatOptions: ErrorMessageOptions = {
        delimiter: { error: '\n' },
        transform: ({ errorMessage }) => ` 🔥 .env: ${errorMessage}`,
        code: { enabled: false },
        path: { enabled: false },
      };
      console.log(generateErrorMessage(validation.error.issues, errorFormatOptions));
    }

    value = await getter();
    validation = schema.safeParse(value);
  }
  return value;
};


const setupDb = async (prefix: string, saltRounds: number) => {
  /**
   * Reuses `pgsqlDefaults` so that user is always suggested
   * values he enter previously
   */
  pgsqlDefaults.pgsqlHost = await input({
    message: `${prefix} PostgreSQL host:`,
    default: pgsqlDefaults.pgsqlHost,
  });
  pgsqlDefaults.pgsqlPort = parseInt(await input({
    message: `${prefix} PostgreSQL port:`,
    default: `${pgsqlDefaults.pgsqlPort}`,
    validate: value => isNaN(parseInt(value)) ? 'Please enter a valid port number': true
  }));
  pgsqlDefaults.pgsqlDatabase = await validateField(
    async () => input({
      message: `${prefix} PostgreSQL database name:`,
      default: pgsqlDefaults.pgsqlDatabase,
    }),
    z.string().nonempty(),
  );
  pgsqlDefaults.pgsqlUsername = await validateField(
    async () => input({
      message: `${prefix} PostgreSQL username:`,
      default: pgsqlDefaults.pgsqlUsername,
    }),
    z.string().nonempty(),
  );
  pgsqlDefaults.pgsqlPassword = await password({
    message: `${prefix} PostgreSQL password:`,
    default: pgsqlDefaults.pgsqlPassword,
  });

  // Test database connection
  try {
    const db = await Postgres.connect(
      pgsqlDefaults.pgsqlUsername,
      pgsqlDefaults.pgsqlPassword,
      pgsqlDefaults.pgsqlDatabase,
      pgsqlDefaults.pgsqlHost,
      pgsqlDefaults.pgsqlPort
    );
    await Postgres.query(db, 'SELECT current_database()');
    await Postgres.disconnect(db);
  } catch (error) {
    console.log(' 🔥 Failed to connect to the PostgreSQL using given credentials');
    return;
  }

  const shouldSeedDb = await confirm({
    message: `${prefix} Do you want to create database schema?`,
    default: defaultSeedDb[env],
  });

  if (shouldSeedDb) {
    await seedDb(prefix, pgsqlDefaults, saltRounds);
  }

  return pgsqlDefaults;
};

const seedDb = async (prefix: string, cfg: typeof pgsqlDefaults, saltRounds: number) => {
  const db = await Postgres.connect(
    cfg.pgsqlUsername,
    cfg.pgsqlPassword,
    cfg.pgsqlDatabase,
    cfg.pgsqlHost,
    cfg.pgsqlPort
  );

  const schema = readFileSync(join(__dirname, '..', 'server', 'schema.sql')).toString();
  await Postgres.query(db, schema);

  console.log(' ✅ Database schema created');

  console.log(' 👦 Please enter information for the default API user');
  console.log('    This user will be used to log in into the API');

  const userName = await validateField(
    async () => input({ message: `${prefix} Full name:` }),
    UserShape.name,
  );

  const userEmail = await validateField(
    async () => input({ message: `${prefix} Email:` }),
    UserShape.email,
  );

  const userPassword = await validateField(
    async () => password({ message: `${prefix} Password:` }),
    UserPasswordSchema,
  );

  await Postgres.query(
    db,
    'INSERT INTO "public"."users" ("name", "email", "password") VALUES ($1::text, $2::citext, $3::text);',
    [userName, userEmail, await Password.encrypt(userPassword, saltRounds)],
  );

  await Postgres.disconnect(db);
};

/**
 * Asks questions and generates .env file
 */
const setupEnv = async (env: Environment) => {
  const prefix = `[${env.toUpperCase()}]`;

  const httpHost = await input({
    message: `${prefix} HTTP server host:`,
    default: 'localhost',
  });
  const httpPort = await input({
    message: `${prefix} HTTP server port:`,
    default: `${defaultHttpPorts[env]}`,
    validate: value => isNaN(parseInt(value)) ? 'Please enter a valid port number': true
  });
  const httpLog = await confirm({
    message: `${prefix} Do you want to output server logs to stdout?`,
    default: defaultHttpLog[env],
  });

  const saltRounds = parseInt(await input({
    message: `${prefix} How many salt rounds do you want to use for password encryption:`,
    default: '11',
    validate: value => isNaN(parseInt(value)) ? 'Please enter a valid number': true
  }));

  // Ask for database connection params until connection succeeds
  let pgsql;
  while (!pgsql) pgsql = await setupDb(prefix, saltRounds);

  // Generate public and private keys for JWTs
  const { privateKey, publicKey } = generate(2048);

  const filename = `.env.${env}`;
  const envContents = generateEnvContents({
    httpHost,
    httpPort,
    httpLog,
    saltRounds,
    privateKey,
    publicKey,
    ...pgsql,
  });

  writeFileSync(join(__dirname, '..', filename), envContents, { flag: 'w' });
};


/**
 * Generates .env file contents
 */
const generateEnvContents = (data: {
  httpHost: string;
  httpPort: string;
  httpLog: boolean;
  saltRounds: number;
  privateKey: Buffer;
  publicKey: Buffer;
} & typeof pgsqlDefaults) => `HTTP_HOST = "${data.httpHost}"
HTTP_PORT = ${data.httpPort}\n
HTTP_LOG = ${data.httpLog ? 'true' : 'false'}\n
PGSQL_HOST = ${data.pgsqlHost}
PGSQL_PORT = ${data.pgsqlPort}
PGSQL_DATABASE = ${data.pgsqlDatabase}
PGSQL_USERNAME = ${data.pgsqlUsername}
PGSQL_PASSWORD = ${data.pgsqlPassword}\n
PASSWORD_SALT_ROUNDS = ${data.saltRounds}\n
JWT_PRIVATE_KEY = "${data.privateKey.toString('ascii').trim()}"\n
JWT_PUBLIC_KEY = "${data.publicKey.toString('ascii').trim()}"\n`;


const env = process.argv[2] as (Environment | undefined);
if (env && environments.includes(env)) {
  setupEnv(env);
} else {
  console.log('Unknown environment: ', env);
  process.exit(1);
}
