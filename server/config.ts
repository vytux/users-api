import { ErrorMessageOptions, generateErrorMessage } from 'zod-error';
import { config } from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  env: z.string(),

  HTTP_PORT: z.coerce.number().positive().describe('Port used to server http'),
  HTTP_HOST: z.string().nonempty().describe('Host to bound http socket to'),

  HTTP_LOG: z.preprocess(
    n => typeof n === 'string' && n.toLowerCase() === 'true',
    z.boolean(),
  ).describe('Should server logs be printed to stdout?'),

  PGSQL_HOST: z.string().nonempty().describe('PostgreSQL host'),
  PGSQL_PORT: z.coerce.number().gt(1).describe('PostgreSQL port'),
  PGSQL_DATABASE: z.string().nonempty().describe('PostgreSQL database name'),
  PGSQL_USERNAME: z.string().nonempty().describe('PostgreSQL user name'),
  PGSQL_PASSWORD: z.string().nonempty().describe('PostgreSQL user password'),

  PASSWORD_SALT_ROUNDS: z.coerce.number().gt(1).describe('How many encryption rounds to use for passwords'),

  JWT_PRIVATE_KEY: z.string().nonempty().describe('Private key JWT will be encrypted with'),
  JWT_PUBLIC_KEY: z.string().nonempty().describe('Public key JWT will be decrypted with'),
});

let result: z.infer<typeof envSchema>;

try {
  const path = process.env.NODE_ENV
    ? `.env.${process.env.NODE_ENV.toLowerCase()}`
    : '.env';

  const cfg = config({ path });

  // Throw error if reading configuration failed
  if (cfg.error) {
    const error = new z.ZodError([]);
    error.addIssue({
      code: z.ZodIssueCode.custom,
      path: [path],
      message: cfg.error.message,
    });
    throw error;
  }

  result = envSchema.parse({
    env: process.env.NODE_ENV?.toLowerCase() ?? 'production',
    ...cfg.parsed,
  });
} catch (error) {
  // Format caught zod errors
  if (error instanceof z.ZodError) {
    const errorFormatOptions: ErrorMessageOptions = {
      delimiter: { error: '\n' },
      transform: ({ errorMessage }) => ` 🔥 .env: ${errorMessage}`,
    };

    // eslint-disable-next-line no-console
    console.log(generateErrorMessage(error.issues, errorFormatOptions));
    process.exit(1);
  } else {
    throw error;
  }
}

export default result;