// "use strict";
// https://betterprogramming.pub/testing-nodejs-apps-that-interact-with-external-apis-with-nock-97e1957e4130

const nock = require('nock');
const request = require('supertest');
const app = require('../app');
const test = require('./test.json');

// const mockResult = {
//     songs: resultSongs, 
//     artists: resultArtists, 
//     albums: resultAlbums, 
//     playlists: resultPlaylists, 
//     musicVideos: resultMusicVideos
// } 

describe('axios testing', () => {
    it('should work for term search', async function() { 
        // Set up the mock request
        nock('https://api.music.apple.com')
            .get(`/v1/catalog/us/search?term=beatles&limit=8`)
            .reply(200, test);

        const result = await request(app)
            .get(`/applemusic/songs/beatles`);

        expect(result.status).toBe(201);
        // expect("songId": "1441164430").tobe
        expect(result.body.songs.length).toEqual(8);
        expect(result.body.songs[0]).toEqual(expect.objectContaining({
            songId: expect.any(String),
            songPreview: expect.any(String),
            songDownloadPreview: expect.any(String),
            songName: expect.any(String),
            songArtist: expect.any(String),
            songGenreName: expect.any(Array),
            songImageUrl: expect.any(String)
        }))
    })
}); 