const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const User = require("../models/user");



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new ExpressError("Username and Password Required", 400);
        }
        if (await User.authenticate(username, password)) {
            const token = jwt.sign({ username }, SECRET_KEY);
            User.updateLoginTimestamp(username)
            return res.json({ message: `Logged In ${username}`, token })
        } else {
            throw new ExpressError('Invalid Username / Password combo', 400)
        };

    } catch (e) {
        return next(e);
    }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, nuxt) => {
    try {
        let { username } = await User.register(req.body)
        const token = jwt.sign({ username }, SECRET_KEY);
        User.updateLoginTimestamp(username)
        return res.json({ message: `Welcome ${username}`, token })
    } catch (e) {
        return next(e)
    }
})


module.exports = router;
