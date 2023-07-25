import Action from 'framework/action';
import expect from 'expect';
import { z } from 'zod';

describe('action', () => {
  const toUpper = (data: { text: string}) => data.text.toUpperCase();

  it('creates correct GET action', () => {
    const result = Action.get({
      route: '/toUpper/:text',
      params: { text: z.string() },
    }, toUpper);

    expect(result.method).toBe('GET');
    expect(result.route).toBe('/toUpper/:text');
    expect(result({ text: 'John' })).toBe('JOHN');
  });

  (['post', 'put', 'delete'] as const).forEach(
    method => it(`creates correct ${method.toUpperCase()} action`, () => {
      const result = Action[method]({
        route: '/toUpper',
        body: { text: z.string() },
      }, toUpper);

      expect(result.method).toBe(method.toUpperCase());
      expect(result.route).toBe('/toUpper');
      expect(result({ text: 'John' })).toBe('JOHN');
    }),
  );

  it('passes url params', () => {
    const result = Action.get({
      route: '/toUpper/:text',
      params: { text: z.string() },
    }, toUpper);

    expect(result({ text: 'John' })).toBe('JOHN');
  });

  it('passes query params', () => {
    const result = Action.get({
      route: '/toUpper',
      query: { text: z.string() },
    }, toUpper);

    expect(result({ text: 'John' })).toBe('JOHN');
  });

  it('passes body params', () => {
    const result = Action.post({
      route: '/toUpper',
      body: { text: z.string() },
    }, toUpper);

    expect(result({ text: 'John' })).toBe('JOHN');
  });

  it('passes header params', () => {
    const result = Action.post({
      route: '/toUpper',
      headers: { text: z.string() },
    }, toUpper);

    expect(result({ text: 'John' })).toBe('JOHN');
  });
});
