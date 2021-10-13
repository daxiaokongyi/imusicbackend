"use strict"

const db = require('../db');
const bcrypt = require('bcrypt');
const {BCRYPT_WORK_FACTOR} = require('../config');
const {sqlForPartialUpdate} = require('../helpers/sql');
const {UnauthorizedError,
       BadRequestError, 
       NotFoundError
} = require('../expressError');

/** create a class with function for users */
class User {
    /** authenticate user with username and password
     * returns an object with keys of username, first_name, last_name, email
     * throw unauthorized error if no user found or password is incorrect
     */
    static async authenticate(username, password) {
        // try to see if user can be found
        const result = await db.query(
            `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email
            FROM users
            WHERE username = $1`,
            [username]
        )

        // get user from result
        const user = result.rows[0];
        
        // check password if user is found
        if (user) {
            // compare hashed password to a new hashed one from input password
            const isValid = await bcrypt.compare(password, user.password);

            if (isValid === true) {
                // "hide" user's hashed password before returning the current user's infomation 
                delete user.password;
                return user;
            }
        }

        // if user is not found or password is invalid, throw unauthorized errors
        throw new UnauthorizedError("Invalid username/password");
    }

    /** Sign up user with data required
     * return an object with keys of username, first_name, last_name, email
     * throw bad request error when username is duplicates
     */
    static async signup({username, password, firstName, lastName, email}) {
        // check if duplicate is true or not
        const duplicateCheck = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`,
            [username]
        )

        // return bad request error if duplicate of username was found
        if(duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        // if user name is valid, hash the input password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        // insert the new user into the database
        const result = await db.query(
            `INSERT INTO users
                (username,
                password,
                first_name,
                last_name,
                email)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING 
                username,
                first_name AS "firstName",
                last_name AS "lastName",
                email`,
            [
                username,
                hashedPassword,
                firstName,
                lastName,
                email,
            ],
        );

        // get and return new user with returning user info from database
        const user = result.rows[0];
        return user;
    }

    /** get detail of given username
    * return {username, first_name, last_name, email} 
    * where songs is the favorite of the given user
    */

    static async get(username) {
        const userResult = await db.query(
            `SELECT 
                username,
                first_name AS "firstName",  
                last_name AS "lastName",
                email
            FROM users
            WHERE username = $1`,
            [username]
        );

        const user = userResult.rows[0];

        // check if user is found
        if (!user) throw new NotFoundError(`No user ${username} was found`);

        // get all existing user's favourite songs
        const userSongsResult = await db.query(
            `SELECT f.songs_id
             FROM favorites AS f
             WHERE f.username = $1`,
             [username]
        ) 

        if (userSongsResult.rows.length !== 0) {
            // get all favorited songs' id 
            const songsId = userSongsResult.rows.map(each => {
                return parseInt(each.songs_id);
            })
            // get detail for each favorited song 
            const favDetails = await db.query(
                `SELECT song_id AS "songId",
                        song_name AS "songName",
                        song_artist AS "songArtist",
                        song_genre_names AS "songGenreNames"
                 FROM songs
                 WHERE id in (${songsId})`
            )
            // apply all favorited songs with details to the user
            user.favoriteSongs = favDetails.rows.map(
                each => [each.songId, each.songName, each.songArtist, each.songGenreNames]
            )
        } else {
            // apply empty array to user if no favorited songs
            user.favoriteSongs = [];
        }

        return user;
    }

    /** Update user's data
     * data that can be editted is firstName, lastName, password, email, isAdmin
     * data return are username, firstName, lastName, email, isAdmin
     * return not found error is no user can be found
     * update is for partial
     * 
     */

    static async update(username, data) {
        // get the current user's password
        const currentUser = await db.query(
            `SELECT password
            FROM users
            WHERE username = $1`,
            [username]
        );

        // check if data is empty
        if (Object.keys(data).length === 0) throw new BadRequestError('Please input correct password to continue');

        // confirm the input password 
        let validPasword;
        if (data.password) {
            validPasword = await bcrypt.compare(data.password, currentUser.rows[0].password);
        }

        // check if password is correct or not
        if (!validPasword) {
            throw new UnauthorizedError(`Password is incorrect. Please try again`);
        } else {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        const {setCols, values} = sqlForPartialUpdate(
            data, 
            {
                firstName : "first_name",
                lastName : "last_name",
            }); 

        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users
                            SET ${setCols}
                            WHERE username = ${usernameVarIdx}
                            RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email`;

        // update the data in the database
        const result = await db.query(querySql, [...values, username]);
        // return the updated user
        const user = result.rows[0];

        // check if user exists
        if(!user) throw new NotFoundError(`No user ${username} found`);

        // get all existing user's favourite songs
        const userSongsResult = await db.query(
            `SELECT f.songs_id
             FROM favorites AS f
             WHERE f.username = $1`,
             [username]
        ) 

        if (userSongsResult.rows.length !== 0) {
            const songsId = userSongsResult.rows.map(each => {
                return parseInt(each.songs_id);
            })

            const favDetails = await db.query(
                `SELECT song_id AS "songId",
                        song_name AS "songName",
                        song_artist AS "songArtist",
                        song_genre_names AS "songGenreNames"
                 FROM songs
                 WHERE id in (${songsId})`
            )
            // apply favorited songs to the user
            user.favoriteSongs = favDetails.rows.map(
                each => [each.songId, each.songName, each.songArtist, each.songGenreNames]
            )
        } else {
            // apply empty array if no favorited songs are found from the current user
            user.favoriteSongs = [];
        }

        delete user.password;
        return user;
    }

    /** set songs as user's favorite */

    static async setFavorite(username, songId) {
        // get user based on the username given
        const usernameSelected = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`, 
            [username]
        );

        const user = usernameSelected.rows[0];

        // check if this user can be found
        if (!user) throw new NotFoundError(`No username ${username} found`);

        // get song based on its song_id
        const songSelected = await db.query(
            `SELECT id
            FROM songs
            WHERE song_id = $1`,
            [songId]
        );

        const song = songSelected.rows[0];

        // check if this song can be found with its id
        if (!song) throw new NotFoundError(`No song with ID of ${songId} found`);

        // check if this song is in user's favorited already
        let isInFavorited = await db.query(
            `SELECT username
            FROM favorites
            WHERE username = $1
            AND songs_id = $2`,
            [username, song.id]
        )

        if (isInFavorited.rows.length !== 0) throw new BadRequestError('This song is already in the favorited list');

        // set this song to be user's favorite
        await db.query(
            `INSERT INTO favorites (username, songs_id)
            VALUES ($1, $2)`,
            [username, song.id]
        );
    } 

    static async deleteFavorite(username, songId) {
        // get user based on the username given
        const usernameSelected = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`, 
            [username]
        );
        // check if this user can be found
        const user = usernameSelected.rows[0];
        if (!user) throw new NotFoundError(`No username ${username} found`);

        // get song based on its song_id
        const songSelected = await db.query(
            `SELECT id
            FROM songs
            WHERE song_id = $1`,
            [songId]
        );
        // check if this song can be found
        const song = songSelected.rows[0];

        if (!song) throw new NotFoundError(`No song with ID of ${songId} found`);

        // remove this song from user's favorite
        const songDeletedFromFav = await db.query(
            `DELETE 
             FROM favorites
             WHERE username = $1
             AND songs_id = $2
             RETURNING $3`,
             [username, song.id, songId]
        )

        if (!songDeletedFromFav) throw new NotFoundError(`No song with ID of ${songId} was found with ${username}`);

        // remove this song from songs database
        const songDeletedFromSongs = await db.query(
            `DELETE 
             FROM songs
             WHERE id = $1`,
             [song.id]
        )

        if (!songDeletedFromSongs) throw new NotFoundError(`No song with id of ${songId} was found`);

        return song.id;
    }
}

module.exports = User;