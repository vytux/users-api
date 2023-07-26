import Action from 'framework/action';
import expect from 'expect';
import { z } from 'zod';

describe('action', () => {
  const toUpper = (userId: string | undefined, data: { text: string}) => data.text.toUpperCase();

  it('creates correct GET action', () => {
    const result = Action.publicGet({
      route: '/toUpper/:text',
      params: { text: z.string() },
    }, toUpper);

    expect(result.method).toBe('GET');
    expect(result.route).toBe('/toUpper/:text');
    expect(result(undefined, { text: 'John' })).toBe('JOHN');
  });

  it('creates correct POST action', () => {
    const result = Action.publicPost({
      route: '/toUpper',
      body: { text: z.string() },
    }, toUpper);

    expect(result.method).toBe('POST');
    expect(result.route).toBe('/toUpper');
    expect(result(undefined, { text: 'John' })).toBe('JOHN');
  });

  it('creates correct PUT action', () => {
    const result = Action.publicPut({
      route: '/toUpper',
      body: { text: z.string() },
    }, toUpper);

    expect(result.method).toBe('PUT');
    expect(result.route).toBe('/toUpper');
    expect(result(undefined, { text: 'John' })).toBe('JOHN');
  });

  it('creates correct PATCH action', () => {
    const result = Action.publicPatch({
      route: '/toUpper',
      body: { text: z.string() },
    }, toUpper);

    expect(result.method).toBe('PATCH');
    expect(result.route).toBe('/toUpper');
    expect(result(undefined, { text: 'John' })).toBe('JOHN');
  });

  it('creates correct DELETE action', () => {
    const result = Action.publicDelete({
      route: '/toUpper',
      body: { text: z.string() },
    }, toUpper);

    expect(result.method).toBe('DELETE');
    expect(result.route).toBe('/toUpper');
    expect(result(undefined, { text: 'John' })).toBe('JOHN');
  });

  it('passes url params', () => {
    const result = Action.publicGet({
      route: '/toUpper/:text',
      params: { text: z.string() },
    }, toUpper);

    expect(result(undefined, { text: 'John' })).toBe('JOHN');
  });

  it('passes query params', () => {
    const result = Action.publicGet({
      route: '/toUpper',
      query: { text: z.string() },
    }, toUpper);

    expect(result(undefined, { text: 'John' })).toBe('JOHN');
  });

  it('passes body params', () => {
    const result = Action.publicPost({
      route: '/toUpper',
      body: { text: z.string() },
    }, toUpper);

    expect(result(undefined, { text: 'John' })).toBe('JOHN');
  });
});
