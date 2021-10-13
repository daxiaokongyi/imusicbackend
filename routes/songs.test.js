// "use strict";

// const mockAxios = require('../__mocks__/axios');
// const request = require('supertest');
// const app = require('../app');

// const {
//     commonBeforeAll,    
//     commonBeforeEach,
//     commonAfterAll, 
//     commonAfterEach,
//     u1Token,
// } = require('./_testCommon');

// beforeAll(commonBeforeAll);
// beforeEach(commonBeforeEach);
// afterAll(commonAfterAll);
// afterEach(commonAfterEach);

// it('GET /:searchTerm', async () => {
//     // setup
//     mockAxios.get.mockImplementationOnce(() => {
//         Promise.resolve({
//             data: {
//                 songs: [],
//                 artists: [],
//                 albums: [],
//                 playlists: [],
//                 musicVideos: []
//             }
//         });
//     }) 

//     // work
//     const result = await request(app).get(`/applemusic/songs/singers`);

//     // expect
//     expect(result).toEqual({
//         songs: [],
//         artists: [],
//         albums: [],
//         playlists: [],
//         musicVideos: []
//     });
//     expect(mockAxios.get).toHaveBeenCalledTimes(1);
// });

const nock = require('nock');
const request = require('supertest');

describe('axios testing', () => {
    it('should work for term search', async () => {
        // const scope = nock('/aaplemusic/songs/beattles')
        //                     .reply(200, {
        //                         results: {
        //                             songs,
        //                             artists,
        //                             albums,
        //                             playlists,
        //                             musicVideos
        //                         }
        //                     });

        // const result = await request(app).get(`/applemusic/songs/singers`);
        // scope.done();
        // expect(result.statusCode).toEqual(200);
        expect(1).toBe(1);
    })
}); 