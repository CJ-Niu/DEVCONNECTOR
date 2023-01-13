const express = require('express');
const router = express.Router();                                // express router
const auth = require('../../middleware/auth');                  // middleware
const User = require('../../models/User');                      // user model
const jwt = require('jsonwebtoken');                            // json web token
const config = require('config');                               // for getting jwtSecret
const bcrypt = require('bcryptjs');                             // use to check for password match
const { check, validationResult } = require('express-validator/check')      // express validator

// @route               GET api/auth
// @description         Test route
// @access              Public (public route don't need a token, but private does)
router.get('/', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password');      // we want the user data
        res.json(user);                                                         // but we don't want user password, so '-password' 
    } catch {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }

});                                                                             // create a route


// @route               POST api/auth
// @desc                Authenticate user & get token
// @access              Public
router.post('/', [
    check('email', 'Please include a valid email!')
        .isEmail(),
    check('password', 'Password is required!')
        .exists()
], 
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {                                // errors not empty --> something wrong, user did not fill out all form by requirement
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;                   // get things we needed from request body

    try {
        //  - see if user exist
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials!' }] });
        }

        //  - check if password match
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials!' }] });
        }
        
        //  - return json web token
        const payload = {                                   // Get payload which includes user ID
            user: {
                id: user.id
            }
        }

        jwt.sign(                                           // Sign the token
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000 },                          //      expire count by second: 3600 sec --> one hour
            (err, token) => {                               //      call back
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch(err) {
        console.error(err.message);                         //      if something goes wrong
        res.status(500).send('Sever Error!');
    }

});

module.exports = router;                                    // export the route