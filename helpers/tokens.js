const jwt = require('jsonwebtoken');
require('dotenv').config();

// Return signed JWT from user data 
function createToken (user) {
    let payload = {
        username: user.username
    };

    return jwt.sign(payload, process.env.SECRET_KEY);
}

module.exports = {createToken};