"use strict";

// connect to test DB
process.env.NODE_ENV = 'test';

// imports db
const db = require('../db');
const Song = require('./songs'); 
const {BadRequestError} = require('../expressError');

const {
    commonBeforeEach,
    commonAfterEach,
    commonBeforeAll,
    commonAfterAll,
} = require('./_testCommon');

beforeEach(commonBeforeEach)
beforeAll(commonBeforeAll);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// create a Song, check good and bad requests
describe("create a song", function() {
    let songId = 1000000011;
    let songName = 'newsongname';
    let songArtistName = 'newsongartist';
    let genreNames = 'newSongGenreName';
    let testSong = {
        songId: 1000000011,
        songName: 'newsongname',
        songArtistName: 'newsongartist',
        songGenreNames: 'newSongGenreName'
    }

    test("good request: creating a song works", async function() {
        let song = await Song.addSongToDatabase(songId, songName, songArtistName, genreNames);
        expect(song).toEqual([testSong]);
    })

    test("bad request: creating the same song twice", async function() {
        try {
            await Song.addSongToDatabase(1000000003, 'name3', 'artist3', 'mandpop');
        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy();
        }
    });
})

// fetch a song's detail
describe('get detail of the song', function() {
    test ('good request for getting the detail of a song', async () => {
        let result = await db.query(`
            SELECT song_name AS "songName"
            FROM songs
            WHERE song_name = $1`,
            ['name1']
        )
        expect(result.rows.length).toEqual(1);
        expect(result.rows[0]).toEqual({songName:'name1'});
    })

    test ('bad request for getting the detail of a wrong song', async () => {
        let result = await db.query(`
            SELECT song_name AS "songName"
            FROM songs
            WHERE song_name = $1`,
            ['newwrongsongname']
        )
        expect(result.rows.length).toEqual(0);
    })
})

// check song's favorited list
describe('check if a song is in the favorited list', function() {
    test ('good request that the current song is in the favorited list of user', async () => {
        let result = await Song.checkIfFavorited(1000000001, 'username1');
        expect(result).toEqual(true);
    });

    test ('bad request that he current song is not in the favorited list of user', async () => {
        let result = await Song.checkIfFavorited(1000000001, 'username2');
        expect(result).toEqual(false);
    })
});
