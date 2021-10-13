/**
 * ExpressError extends normal JS Error so that status can be added in
 * The error-handling middleware will return this
 */

class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}

/** Bad Request with status 400 */
class BadRequestError extends ExpressError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}

/** Unauthorized Error with status 401 */
class UnauthorizedError extends ExpressError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

/** Forbidden Error with status 403 */
class ForbiddenError extends ExpressError {
    constructor(message = "Forbidden Error") {
        super(message, 403);
    }
}

/** Not Found Error with status 404 */
class NotFoundError extends ExpressError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}

module.exports = {
    ExpressError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError
};








