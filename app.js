"use strict";

const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require("morgan");

const {authenticateJWT} = require('./middleware/auth');
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const songsRoutes = require("./routes/songs");

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/applemusic/songs", songsRoutes);

const { NotFoundError } = require('./expressError');

// handler for 404
app.use(function (req, res, next) {
    const error = new NotFoundError();
    return next(error); 
}) 

// global error handler used to catch any unhandled errors here
app.use(function(err, req, res ,next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);

    let status = err.status || 500;
    let message = err.message;

    return res.status(status).json({
        error: {message, status},
    });
});

module.exports = app;

