\echo 'Delete and recreate music db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE music;
CREATE DATABASE music;
\connect music

\i music-schema.sql
-- \i music-seed.sql