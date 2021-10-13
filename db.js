"use strict";

/** setup database for music */

const {Client} = require('pg');
const {getDataBaseUri} = require('./config');
require('dotenv').config();

let db;

/** specify a database to connect to depends on an environment variable we specify to use the test DB or not
, and establish and export a connection */

if (process.env.NODE_ENV === "production") {
    db = new Client({
        connectionString: getDataBaseUri(),
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    db = new Client({
        connectionString: getDataBaseUri()
    });
}

db.connect();

module.exports = db;