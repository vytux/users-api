import { Client } from 'pg';

/**
 * Connects to PostgreSQL
 */
export const postgresConnect = async (
  username: string,
  password: string,
  database: string,
  host: string,
  port = 5432
) => {
  const client = new Client({
    user: username,
    password,
    database,
    host,
    port,
  });
  await client.connect();
  return client;
}

/**
 * Disconnects from PostgreSQL
 */
export const postgresDisconnect = async (connection: Client) =>
  await connection.end();

/**
 * Runs prepared query with given values and returns query result
 */
export const postgresQuery = async (
  connection: Client,
  query: string,
  args: unknown[] = [],
) =>
  await connection.query(query, args);
