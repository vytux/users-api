import { postgresConnect, postgresDisconnect, postgresQuery } from 'services/pgsql';
import { Client } from 'pg';
import config from 'config';

let connection: Client | undefined;

/**
 * Connects to the database if needed and performs a given query
 */
export const databaseQuery = async (
  query: string,
  args: unknown[] = [],
) => {
  if (!connection) {
    /**
     * In production we should probably use a connection pool,
     * but a single connection will suffice for this demo
     */
    connection = await postgresConnect(
      config.PGSQL_USERNAME,
      config.PGSQL_PASSWORD,
      config.PGSQL_DATABASE,
      config.PGSQL_HOST,
      config.PGSQL_PORT,
    );
  }
  return postgresQuery(connection, query, args);
};

/**
 * Disconnects from the database
 */
export const databaseDisconnect = async () => {
  if (connection) {
    await postgresDisconnect(connection)
    connection = undefined;
  }
};
