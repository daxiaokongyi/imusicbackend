"use strict";

const request = require('supertest');
const app = require('../app');

const {
    commonBeforeAll,    
    commonBeforeEach,
    commonAfterAll, 
    commonAfterEach,
    u1Token,
    u2Token,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterAll(commonAfterAll);
afterEach(commonAfterEach);

describe('GET /users/:username', function() {
    test('good request that getting user info successfully', async function () {
        // testing with fetching user detail
        const resp = await request(app)
            .get('/users/username1')
            .set('authorization', `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            user: {
                username: 'username1',
                firstName: 'firstname1',
                lastName: 'lastname1',
                email: 'user1@email.com',
                favoriteSongs: [
                    [1000000001, 'name1', 'artist1', 'pop']
                ]
            }
        });
    });
    test('bad request that unauth for other users', async function() {
        const resp = await request(app)
            .get('/users/username1')
            .set('authorization', `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(401);
    });
    test('bad request that unauth without signing in', async function() {
        const resp = await request(app)
            .get('/users/none')
        expect(resp.statusCode).toEqual(401);
    });
})

describe('PATCH /users/:username', function () {
    test('good request for same user to update info', async () => {
        const resp = await request(app)
            .patch('/users/username1')
            .send({
                firstName: 'newfirstname1',
                password: 'password1'
            })
            .set('authorization', `Bearer ${u1Token}`);
        expect(resp.body).toEqual({
            user: {
                username: 'username1',
                firstName: 'newfirstname1',
                lastName: 'lastname1',
                email: 'user1@email.com',
                favoriteSongs: [
                    [1000000001, 'name1', 'artist1', 'pop']
                ]
            }
        });
    });
    test('bad request without putting confirmed password that required', async () => {
        const resp = await request(app)
            .patch('/users/username1')
            .send({
                firstName: 'newfirstname1',
            })
            .set('authorization', `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });
    test('bad request for a different user tries to update info', async () => {
        const resp = await request(app)
            .patch('/users/username1')
            .send({
                firstName: 'newfirstname1',
                password: 'password1'
            })
            .set('authorization', `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
    });
    test('bad request without signing in', async () => {
        const resp = await request(app)
            .patch('/users/username1')
            .send({
                firstName: 'newfirstname1',
                password: 'password1'
            })
        expect(resp.statusCode).toEqual(401);
    })
    test('bad request if updated data is invalid', async () => {
        const resp = await request(app)
            .patch('/users/username1')
            .send({
                firstName: 1,
                password: 'password1'
            })
            .set('authorization', `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });
    test('bad request if confirmed password is wrong', async () => {
        const resp = await request(app)
            .patch('/users/username1')
            .send({
                firstName: 'username1',
                password: 'wrongpassword'
            })
            .set('authorization', `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
});