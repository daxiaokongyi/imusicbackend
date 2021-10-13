const jwt = require('jsonwebtoken');
const {UnauthorizedError} = require('../expressError');

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            // return payload of username and isAdmin if token is valid
            res.locals.user = jwt.verify(token, process.env.SECRET_KEY);
        }
        return next();
    } catch (error) {
        return next();
    }
}

/** Middlewae to be used when users must be logged in
 * if not, return unauthorized
*/

function ensureLoggedIn(req, res, next) {
    try {
        // if no user info is provied, then throw errors
        if (!res.locals.user) throw new UnauthorizedError();
        return next();
    } catch (error) {
        return next(error);
    }
}

/** Middleware to use when token is valid and user's username matches the one provide as route param
 * if not, return Unauthorized
 */

// function ensureCorrectUserOrAdmin(req, res, next) {
function ensureCorrectUser(req, res, next) {
    try {
        const user = res.locals.user;
        console.log(`user: ${JSON.stringify(user)}`);
        if (!(user && (user.username === req.params.username))) {
            throw new UnauthorizedError();
        }
        return next();
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser
}

