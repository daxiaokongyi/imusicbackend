"use strict"

const jsonschema = require('jsonschema');
const express = require('express');

const router = express.Router();
const {ensureCorrectUser} = require('../middleware/auth');
const userUpdateSchema = require('../schemas/userUpdate.json');

const {BadRequestError} = require('../expressError');
const User = require('../models/users');
const Song = require('../models/songs');

/** GET /[username] => { user }
 * Authorization required: same user-as-:username
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[username] { user } => { user }
 *
 * Data includes:
 *   { firstName, lastName, email }
 *
 * Returns { username, firstName, lastName, email }
 *
 * Authorization required: same-user-as-:username
 **/

router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);

        if (!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors);
        }
        const user = await User.update(req.params.username, req.body);
        return res.json({user});
    } catch (error) {
        return next(error);
    }
});

/** POST /[username]/songs/[id]  
 *
 * Returns {"favortied": true or false}
 *
 * Authorization required: same-user-as-:username
 * */

router.post("/:username/songs/:id", ensureCorrectUser, async function(req, res, next) {
    try {
        const songId = +req.params.id;
        const username = req.params.username;
        const songName = req.body.songName;
        const songArtistName = req.body.songArtistName; 
        const genreNames = req.body.genreNames;

        await Song.addSongToDatabase(songId, songName, songArtistName, genreNames);
        await User.setFavorite(username, songId);
        return res.json({favorited: true});
    } catch (error) {
        return next(error);
    }
});

/** DELETE /[username]/songs/[id]  
 *
 * Returns {"deletedFavorited": songId}
 *
 * Authorization required: same-user-as-:username
 * */

router.delete("/:username/songs/:id", ensureCorrectUser, async function (req, res, next) {
    try {
        const songId = +req.params.id;
        const username = req.params.username;
        const songsId = await User.deleteFavorite(username, songId);
        return res.json({deletedFavorited: songsId});
    } catch (error) {
        return next(error);
    }
});

module.exports = router;