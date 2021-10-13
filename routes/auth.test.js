"use strict";

const request = require('supertest');
const app = require('../app');

const {
    commonBeforeAll,    
    commonBeforeEach,
    commonAfterAll, 
    commonAfterEach
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterAll(commonAfterAll);
afterEach(commonAfterEach);

describe('POST /auth/token', function() {
    test('good request that authentication succeeds', async function() {
        const resp = await request(app)
            .post("/auth/token")
            .send({
                username: 'username1',
                password: 'password1'
            });
        expect(resp.body).toEqual({
            'token':expect.any(String)
        });
    });
    test('unauth with non existing user', async function() {
        const resp = await request(app)
            .post('/auth/token')
            .send({
                username: 'noneuser',
                password: 'password1'
            });
        expect(resp.statusCode).toEqual(401);
    })
    test('unauth with wrong password', async function() {
        const resp = await request(app)
            .post('/auth/token')
            .send({
                username: 'username1',
                password: 'wrongpassword'
            });
        expect(resp.statusCode).toEqual(401);
    })
    test('bad request with missing data', async function() {
        const resp = await request(app)
            .post('/auth/token')
            .send({
                username: 'username1',
            });
        expect(resp.statusCode).toEqual(400);
    })
    test('bad request with a wrong type of data', async function() {
        const resp = await request(app)
            .post('/auth/token')
            .send({
                username: 1,
                password: 'password1'
            });
        expect(resp.statusCode).toEqual(400);
    })
});

describe('POST /auth/register', function() {
    test('good request to sign up a new user successfully',  async function() {
        const resp = await request(app)
            .post('/auth/register')
            .send({
                username: "new",
                password: "password",
                firstName: "first",
                lastName: "last",
                email: "new@email.com"
            });
        expect(resp.statusCode).toEqual(201);
    });
    test('bad request with missing data', async function() {
        const resp = await request(app)
            .post('/auth/register')
            .send({
                username: "new",
                password: "password",
                firstName: "first",
                lastName: "last",
            });
        expect(resp.statusCode).toEqual(400);
    });
    test('bad request with wrong type data', async function() {
        const resp = await request(app)
            .post('/auth/register')
            .send({
                username: "new",
                password: "password",
                firstName: "first",
                lastName: "last",
                email: "bademailformat"
            });
        expect(resp.statusCode).toEqual(400);
    });
    test('bad request with wrong type data', async function() {
        const resp = await request(app)
            .post('/auth/register')
            .send({
                username: 1,
                password: "password",
                firstName: "first",
                lastName: "last",
                email: "new@email.com"
            });
        expect(resp.statusCode).toEqual(400);
    });
})


