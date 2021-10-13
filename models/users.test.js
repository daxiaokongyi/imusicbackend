"use strict";

// connect to test DB
process.env.NODE_ENV = 'test';

// imports db
const db = require('../db');
const User = require('../models/users');
const Song = require('../models/songs');

const {
    UnauthorizedError, 
    BadRequestError,
    NotFoundError
} = require('../expressError');

const {
    commonBeforeEach,
    commonAfterEach,
    commonBeforeAll,
    commonAfterAll,
} = require('./_testCommon');

const { user } = require('pg/lib/defaults');

beforeEach(commonBeforeEach)
beforeAll(commonBeforeAll);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


// authenticate an user with username and password
describe('authenticate an user', function() {
    test('good request that user and password match', async function() {
        const user1 = await User.authenticate('username1', 'password1');
        expect(user1.username).toEqual('username1');
        expect(user1.email).toEqual('user1@email.com');
    })
    test('bad request that user put a wrong password', async function() {
        try {
            await User.authenticate('username1', 'password2');
        } catch (error) {
            expect(error instanceof UnauthorizedError).toBeTruthy();
        }
    })
    test('bad request that user does not exist', async function() {
        try {
            await User.authenticate('username99', 'password1');
        } catch (error) {
            expect(error instanceof UnauthorizedError).toBeTruthy();
        }
    })
})

describe('register a new user', function() {
    test('good request that register successfully', async function() {
        let newUser = await User.signup({
            username: 'username99', 
            password: 'password99',
            firstName: 'firstname99',
            lastName: 'lastname99',
            email: 'user99@gmail.com'
        })
        expect(newUser.email).toEqual('user99@gmail.com');
        let found = await User.authenticate('username99', 'password99');
        expect(found.email).toEqual('user99@gmail.com');
    });
    test('bad request that sign up with dupulicate data', async function() {
        try {
            await User.signup({
                username: 'username1', 
                password: 'password1',
                firstName: 'firstname1',
                lastName: 'lastname1',
                email: 'user1@gmail.com'
            })
        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe('get user information', function() {
    test('good request that getting user info successfullly', async function() {
        let userInfo = await User.get('username1');
        expect(userInfo.email).toEqual('user1@email.com');
    })
    test('bad request that getting no user', async function() {
        try {
            await User.get('nousername');
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    })
});

describe('update user detail', function(){
    test('good request that updating user detail successfully', async function() {
        let userUpdated = await User.update('username1', {firstName: 'firstname1updated', password: 'password1'});
        expect(userUpdated.firstName).toEqual('firstname1updated');
    });
    test('bad request that input a wrong confirmed password', async function() {
        try {
            await User.update('username1', {firstName: 'firstname1updated', password: 'wrongpassword'});
        } catch (error) {
            expect(error instanceof UnauthorizedError).toBeTruthy();
        }
    })
    test('bad request that no input data and password', async function() {
        try {
            await User.update('username1', {});
        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy();
        }        
    });
});

describe('set favorite song to a user', function() {
    test('good request that setting a song as favorite successfully', async function() {
        await User.setFavorite('username1', 1000000002);
        let isFavorited = await Song.checkIfFavorited(1000000002, 'username1');
        expect (isFavorited).toEqual(true);
    });    
    test('bad request that setting a song to the same user more than one time', async function() {
        try {
            await User.setFavorite('username2', 1000000002);
        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy();
        }
    });
    test('bad request if no user is found', async function() {
        try {
            await User.setFavorite('nousername', 1000000001);
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    })
    test('bad request if no such song in the favorited list', async function() {
        try {
            await User.setFavorite('username1', 1000000011);
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    })
})

describe('delete a favorited song', function() {
    test('good request that delete a favorited song successfully', async function() {
        await User.deleteFavorite('username1', 1000000001);
        let isInFavorited = Song.checkIfFavorited(1000000001, 'username1');
        expect(Object.keys(isInFavorited).length).toEqual(0);
    }); 
    test('bad request that has no such user', async function() {
        try {
            await User.deleteFavorite('wronguser', 1000000001)
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    })
    test('bad request that has no such song with given song id', async function() {
        try {
            await User.deleteFavorite('username1', 1000000011);
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }
    })
    test('bad request that if user delete an existing song from favorited list but not belong to this user', async function() {
        try {
            await User.deleteFavorite('username2', 100000001);
        } catch (error) {
            expect(error instanceof NotFoundError).toBeTruthy();
        }    
    }); 
})




