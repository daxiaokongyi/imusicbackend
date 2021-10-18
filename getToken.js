const jwt = require('jsonwebtoken');
require('dotenv').config();

let now = Math.round(new Date().getTime()/1000);
let nowPlus20 = now + (20 * 60) - 1;

// create payload object
let payload = {
    "iss":process.env.ISSUER_ID,
    "iat":now,
    "exp":nowPlus20,
    "aud":"appstoreconnect-v1"
}

let signOptions = {
    "algorithm":"ES256",
    header:{
        "alg":"ES256",
        "kid":process.env.API_KEY_ID,
        "typ":"JWT"
    }
}

let token = jwt.sign(payload, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), signOptions);
console.log(token);

module.exports = token;