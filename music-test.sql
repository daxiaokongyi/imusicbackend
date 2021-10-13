\echo 'Delete and recreate music_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE music_test;
CREATE DATABASE music_test;
\connect music_test

\i music-schema.sql