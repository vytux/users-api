import { Client } from 'pg';

const Postgres = {

  /**
   * Connects to PostgreSQL
   */
  connect: async (
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
  },

  /**
   * Disconnects from PostgreSQL
   */
  disconnect: async (connection: Client) =>
    await connection.end(),

  /**
   * Runs prepared query with given values and returns query result
   */
  query: async (
    connection: Client,
    query: string,
    args: unknown[] = [],
  ) =>
    await connection.query(query, args),

} as const;

export default Postgres;