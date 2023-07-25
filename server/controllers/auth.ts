import { Controller } from 'framework/controller';
import { actionPost } from 'framework/action';
import { z } from 'zod';

export default Controller('/auth', {

  index: actionPost(
    {
      body: {
        username: z.string(),
        password: z.string(),
      },
      output: z.string().describe('JWT'),
    },
    ({ username, password }) => {
      return `nope ${username} x ${password}`;
    },
  ),

});
