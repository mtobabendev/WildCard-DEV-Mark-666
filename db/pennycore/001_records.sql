-- Run only in a dedicated PennyCore database, using its migration owner.
BEGIN;
CREATE SCHEMA IF NOT EXISTS pennycore;
REVOKE ALL ON SCHEMA pennycore FROM PUBLIC;
CREATE TABLE IF NOT EXISTS pennycore.records (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id uuid NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('memory','state','context','governance')),
  record_key text NOT NULL CHECK (record_key ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,119}$'),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object' AND octet_length(payload::text) <= 32768),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS pennycore_records_lookup ON pennycore.records (kind, record_key, id DESC);
REVOKE ALL ON pennycore.records FROM PUBLIC;
REVOKE ALL ON SEQUENCE pennycore.records_id_seq FROM PUBLIC;
COMMIT;
-- After creating a separate non-admin runtime role named pennycore_runtime,
-- the migration owner must grant only CONNECT to this database, then:
-- GRANT USAGE ON SCHEMA pennycore TO pennycore_runtime;
-- GRANT SELECT, INSERT ON pennycore.records TO pennycore_runtime;
-- GRANT USAGE ON SEQUENCE pennycore.records_id_seq TO pennycore_runtime;
-- Do not grant UPDATE, DELETE, TRUNCATE, CREATE, ownership or admin membership.
