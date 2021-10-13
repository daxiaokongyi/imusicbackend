"use strict";

const { BCRYPT_WORK_FACTOR } = require('../config.js');
const db = require('../db.js');
const bcrypt = require('bcrypt');
const {createToken} = require('../helpers/tokens');

let testSongIds = [];

const commonBeforeAll = async () => {
    await db.query('BEGIN');
}

const commonBeforeEach = async () => {
    await db.query('BEGIN');

    // add songs in song's database
    const songResult = await db.query(
        `INSERT INTO 
            songs (song_id, song_name, song_artist, song_genre_names)
         VALUES (1000000001, 'name1', 'artist1', 'pop'),
                (1000000002, 'name2', 'artist2', 'music'),
                (1000000003, 'name3', 'artist3', 'mandpop')
        RETURNING id`
    )

    // testSongIds = songResult.rows.map(each => each.id);
    testSongIds.splice(0, 0, ...songResult.rows.map(r => r.id));

    // add users in users' database
    await db.query(
        `INSERT INTO 
            users (username, password, first_name, last_name, email)
        VALUES ('username1', $1, 'firstname1', 'lastname1', 'user1@email.com'),
            ('username2', $2, 'firstname2', 'lastname2', 'user2@email.com'),
            ('username3', $3, 'firstname3', 'lastname3', 'user3@email3.com')
        RETURNING username`, 
        [
            await bcrypt.hash('password1', BCRYPT_WORK_FACTOR),
            await bcrypt.hash('password2', BCRYPT_WORK_FACTOR),
            await bcrypt.hash('password3', BCRYPT_WORK_FACTOR),
        ]
    );

    // add favorite relationship between users and songs
    await db.query(
        `INSERT INTO 
            favorites (username, songs_id)
        VALUES ('username1', $1),
                ('username2', $2),
                ('username3', $3)`,
        [testSongIds[0], testSongIds[1], testSongIds[2]]
    )
};

const commonAfterEach = async () => {
    await db.query('DELETE FROM songs');
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM favorites');
};

const commonAfterAll = async () => {
    await db.end();
}

const u1Token = createToken({username: 'username1'});
const u2Token = createToken({username: 'username2'});
const u3Token = createToken({username: 'username3'});

module.exports = {
    commonBeforeEach,
    commonAfterEach,
    commonBeforeAll,
    commonAfterAll,
    testSongIds,
    u1Token,
    u2Token,
    u3Token
} 



