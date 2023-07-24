import 'dotenv/config';
import { ErrorMessageOptions, generateErrorMessage } from 'zod-error';
import { z } from 'zod';

const envSchema = z.object({
  HTTP_PORT: z.preprocess(
    n => parseInt(z.string().parse(n), 10),
    z.number().positive(),
  ),
  HTTP_HOST: z.string().nonempty(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const options: ErrorMessageOptions = {
    delimiter: { error: '\n' },
    transform: ({ errorMessage }) => ` 🔥 .env: ${errorMessage}`,
  };

  // eslint-disable-next-line no-console
  console.log(generateErrorMessage(result.error.issues, options));
  process.exit(1);
}

export default result.data;