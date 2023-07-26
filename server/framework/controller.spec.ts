import Action from 'framework/action';
import { Controller } from 'framework/controller';
import expect from 'expect';
import { z } from 'zod';

describe('controller', () => {
  const toUpper = (userId: string | undefined, data: { text: string}) => data.text.toUpperCase();

  it('extends action routes', () => {
    const result = Controller('/test', {
      toUpper: Action.publicGet({
        route: '/toUpper/:text',
        params: { text: z.string() },
      }, toUpper),
    });

    expect(result.toUpper.method).toBe('GET');
    expect(result.toUpper.route).toBe('/test/toUpper/:text');
    expect(result.toUpper(undefined, { text: 'John' })).toBe('JOHN');
  });
});
