"use strict"

const db = require('../db');

class Song {
    // Add songs fetched from API to song's database
    static async addSongToDatabase(songId, songName, songArtistName, genreNames) {
        // check if the selected song is already in the song's database
        const songPreviewCheck = await db.query(
            `SELECT song_id
                FROM songs
                WHERE song_id = $1`,
                [songId],
        );

        if (songPreviewCheck.rows.length !== 0) {
            return;
        }; 

        // add the selected song into database when it's new
        let result = await db.query(
            `INSERT INTO songs
            (song_id, song_name, song_artist, song_genre_names)
            VALUES ($1, $2, $3, $4)
            RETURNING
                song_id AS "songId",
                song_name AS "songName",
                song_artist AS "songArtistName",
                song_genre_names AS "songGenreNames"`,
            [songId, songName, songArtistName, genreNames],
        );
        
        return result.rows;
    }

    static async checkIfFavorited(songId, username) {
        // get song id from the database by its apple sone id
        let songIdInDatabase = await db.query(
            `SELECT id
             FROM songs
             WHERE song_id = $1`,
             [songId]
        )

        // check if this song is in a favorited list, return false if not
        if (songIdInDatabase.rows.length === 0) {
            return false;
        }

        songIdInDatabase = songIdInDatabase.rows[0].id;

        // get song id from favorites table by user name
        let songIdInFav = await db.query(
            `SELECT songs_id
             FROM favorites
             WHERE username = $1`,
            [username]
        )
        
        // get all favorited songs of the current user from the song's database 
        songIdInFav = songIdInFav.rows.map(each => {
            return each.songs_id;
        })

        // check if the current song is one of user's favorite
        return songIdInFav.includes(songIdInDatabase);
    }
}

module.exports = Song;