/**
 * Constants for tests
 */

import config from 'config';

/**
 * Before starting, tests will create a user in a database
 * with these credentials. This user can be used to test
 * the api.
 */
export const defaultTestUser = {
  name: 'Test Tester',
  email: 'testor@testators.com',
  password: 'test-test-test',
} as const;

export const address = `http://${config.HTTP_HOST}:${config.HTTP_PORT}`;
