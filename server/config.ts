import { ErrorMessageOptions, generateErrorMessage } from 'zod-error';
import { config } from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  env: z.string(),
  HTTP_PORT: z.coerce.number().positive(),
  HTTP_HOST: z.string().nonempty(),
  HTTP_LOG: z.preprocess(
    n => typeof n === 'string' && n.toLowerCase() === 'true',
    z.boolean(),
  ),
});

let result: z.infer<typeof envSchema>;

try {
  const path = process.env.NODE_ENV
    ? `.env.${process.env.NODE_ENV.toLowerCase()}`
    : '.env';

  const cfg = config({ path });

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