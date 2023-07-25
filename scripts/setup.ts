import { confirm, input } from '@inquirer/prompts';
import { generate } from 'rsa-keypair';
import { join } from 'path';
import { writeFileSync } from 'fs';

type Environments = 'production' | 'development' | 'test';

const defaultPorts = {
  production: 80,
  development: 3000,
  test: 4000,
} as const;

const defaultHttpLog = {
  production: false,
  development: true,
  test: false,
} as const;

const setupEnv = async (env: Environments) => {
  const prefix = `[env: ${env.toUpperCase()}]`;

  const httpHost = await input({
    message: `${prefix} Host to bound http socket to:`,
    default: 'localhost',
  });

  const httpPort = await input({
    message: `${prefix} Port to bound http socket to:`,
    default: `${defaultPorts[env]}`,
    validate: value => isNaN(parseInt(value)) ? 'Please enter a valid port number': true
  });

  const httpLog = await confirm({
    message: `${prefix} Do you want to output server logs to stdout?`,
    default: defaultHttpLog[env],
  });

  const saltRounds = await input({
    message: `${prefix} How many salt rounds do you want to use for password encryption:`,
    default: '11',
    validate: value => isNaN(parseInt(value)) ? 'Please enter a valid number': true
  });

  const { privateKey, publicKey } = generate(2048);

  const filename = `.env.${env}`;
  const envContents = generateEnvContents({
    httpHost,
    httpPort,
    httpLog,
    saltRounds,
    privateKey,
    publicKey,
  });

  writeFileSync(join(__dirname, '..', filename), envContents, { flag: 'w' });
};

const setup = async () => {

  await setupEnv('development');
  await setupEnv('test');

  const setupProduction = await confirm({
    message: 'Do you want to setup production environment?',
    default: false,
  });

  if (setupProduction) {
    await setupEnv('production');
  }
};

const generateEnvContents = (data: {
  httpHost: string;
  httpPort: string;
  httpLog: boolean;
  saltRounds: string;
  privateKey: Buffer;
  publicKey: Buffer;
}) => `HTTP_HOST = "${data.httpHost}"
HTTP_PORT = ${data.httpPort}

HTTP_LOG = ${data.httpLog ? 'true' : 'false'}

PASSWORD_SALT_ROUNDS = ${data.saltRounds}

JWT_PRIVATE_KEY = "${data.privateKey.toString('ascii').trim()}"

JWT_PUBLIC_KEY = "${data.publicKey.toString('ascii').trim()}"`;

setup();
