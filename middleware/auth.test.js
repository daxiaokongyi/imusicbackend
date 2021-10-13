const jwt = require('jsonwebtoken');

const {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser
} = require('./auth');

const {SECRET_KEY} = require('../config');
const { UnauthorizedError } = require('../expressError');
const testJwt = jwt.sign({username: 'test'}, SECRET_KEY);
const badJwt = jwt.sign({username: 'test'}, 'wrong');


describe('authenticateJWT', function() {
    test('good request that works via header', function () {
        const req = {headers: {authorization: `Bearer ${testJwt}`}};
        const res = {locals:{}};
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            user: {
                iat: expect.any(Number),
                username: 'test',
            }
        });
    });
    test('bad request that having no headers', function() {
        const req = {};
        const res = {locals: {}};
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
    test('bad request that having a wrong token', function() {
        const req = {headers: {authorization: `Bearer ${badJwt}`}};
        const res = {locals: {}};
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});

describe('ensureLoggedin', function() {
    test('good request that logged in confirmed', () => {
        const req = {};
        const res = {locals: {user: {username: 'test'}}};
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        ensureLoggedIn(req, res, next);
    })
    test('bad request if no login', () => {
        const req = {};
        const res = {locals: {}};
        const next = function(err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        ensureLoggedIn(req, res, next);
    })
});

describe('ensure correct user', function () {
    test('good request that having the same user', function() {
        const req = {params: {username: 'test'}};
        const res = {locals: {user: {username: 'test'}}};
        const next = function(err) {
            expect(err).toBeFalsy();
        };
        ensureCorrectUser(req, res, next);
    });
    test('bad request that having different users', function() {
        const req = {params: {username: 'test'}};
        const res = {locals: {user: {username: 'wrong'}}};
        const next = function(err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
        ensureCorrectUser(req, res, next);
    });
    test('bad request if nothing from response', function() {
        const req = {params: {username: 'test'}};
        const res = {locals: {}};
        const next = function(err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }   
        ensureCorrectUser(req, res, next);
    });
});