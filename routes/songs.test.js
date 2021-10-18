// "use strict";
// https://betterprogramming.pub/testing-nodejs-apps-that-interact-with-external-apis-with-nock-97e1957e4130

const nock = require('nock');
const request = require('supertest');
const app = require('../app');
const test = require('./test.json');

describe('axios testing', () => {
    it('should work for term search', async function() { 
        // Set up the mock request
        nock('https://api.music.apple.com')
            .get(`/v1/catalog/us/search?term=beatles&limit=8`)
            .reply(200, test);

        const result = await request(app)
            .get(`/applemusic/songs/beatles`);

        expect(result.status).toBe(200);
        // expect(result.body).toEqual(test);
    })
}); 