-- Adds extensions
CREATE EXTENSION IF NOT EXISTS citext;

-- Adds triggers
CREATE OR REPLACE FUNCTION set_updatedAt() RETURNS trigger AS
$set_updatedAt$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$set_updatedAt$ LANGUAGE plpgsql;

-- Creates tables

DROP TABLE IF EXISTS "users";

CREATE TABLE "users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "email" citext NOT NULL,
    "password" text NOT NULL,
    "updatedAt" timestamp(3) NOT NULL DEFAULT now(),
    "createdAt" timestamp(3) NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "users_email" UNIQUE ("email")
);

CREATE TRIGGER table_update BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE PROCEDURE set_updatedAt();
