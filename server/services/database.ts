import { postgresConnect, postgresDisconnect, postgresQuery } from 'services/pgsql';
import { Client } from 'pg';
import config from 'config';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

let connection: Client | undefined;

export type DatabaseFieldType = 'uuid' | 'text' | 'citext' | 'timestamp';

export type FieldTypes<T extends object> = {
  readonly [K in keyof T as string]: DatabaseFieldType;
};

export const databaseFields = (fields: string[]): string =>
  fields.map(f => `"${f}"`).join(',');

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

/**
 * Creates database table's `table` record with given values.
 * Validates and sets values based on zod schema.
 * Assumes that table has `id` field with `uuid` values.
 */
export const databaseInsert = async <
  Shape extends z.ZodRawShape,
  Schema extends ReturnType<typeof z.object<Shape>>
>(
  table: string,
  schema: Shape,
  data: z.infer<ReturnType<typeof z.object<Shape>>>,
  fieldTypes: FieldTypes<Schema>,
) => {
  const validData = z.object(schema).parse(data);

  const fields = Object.keys(validData) as (keyof typeof validData)[];
  const sql = fields.map((field, i) => ({
    field: `"${String(field)}"`,
    type: `$${i + 2}::${fieldTypes[String(field)]}`,
    value: validData[field],
  }));

  const newId = uuid();
  await databaseQuery(
    `INSERT INTO "${table}" ("id", ${sql.map(f => f.field).join(',')})
    VALUES ($1::${fieldTypes.id}, ${sql.map(f => f.type).join(',')})`,
    [newId, ...sql.map(f => f.value)],
  );

  return newId;
};

/**
 * Updates database table's `table` record with `id`.
 * Validates and sets values based on zod schema.
 */
export const databaseUpdateById = async <
  ID extends z.ZodType,
  Shape extends z.ZodRawShape,
  Schema extends ReturnType<typeof z.object<Shape>>
>(
  table: string,
  schema: Shape,
  id: z.infer<ID>,
  data: z.infer<ReturnType<ReturnType<typeof z.object<Shape>>['partial']>>,
  fieldTypes: FieldTypes<Schema>,
) => {
  const validData = z.object(schema).partial().parse(data);

  // Don't do anything if there is nothing to change
  const fields = Object.keys(validData) as (keyof typeof validData)[];
  if (fields.length === 0) {
    return;
  }

  const sql = fields.map((field, i) => ({
    set: `"${String(field)}" = $${i + 2}::${fieldTypes[String(field)]}`,
    value: validData[field],
  }));

  await databaseQuery(
    `UPDATE "${table}" SET ${sql.map(f => f.set).join(',')} WHERE id = $1::${fieldTypes.id}`,
    [id, ...sql.map(f => f.value)],
  );
};
