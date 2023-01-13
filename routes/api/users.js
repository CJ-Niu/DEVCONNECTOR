const express = require('express');
const router = express.Router();                                // express router
const User = require('../../models/User');                      // bring out user model
const gravatar = require('gravatar')                            // gravatar
const bcrypt = require('bcryptjs');                             // encrypt password
const jwt = require('jsonwebtoken');                            // json web token
const config = require('config');                               // for getting jwtSecret
const { check, validationResult } = require('express-validator/check')      // express validator

// This is just for Test:
// @route               GET api/users
// @description         Test route
// @access              Public (public route don't need a token, but private does)
// router.get('/', (req, res) => res.send('User route'));      // create a route

// Working Code:
// @route       POST api/users
// @desc        Register user
// @access      Public
router.post('/', [
    check('name', 'Name is required!')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email!')
        .isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
        .isLength({ min : 6})
], 
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {                                // errors not empty --> something wrong, user did not fill out all form by requirement
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;             // get things we needed from request body

    try {
        // User Registration
        //  - see if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists!' }] });
        }

        //  - get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',                                       // default size
            r: 'pg',                                        // rating: no nude picture
            d: 'mm'                                         // default: default image for gravatar
        })

        user = new User({                                   // Create User
            name,
            email,
            avatar,
            password                                        //      password not encrypt yet
        });

        //  - encrypt password
        const salt = await bcrypt.genSalt(10);              // Hashing
        user.password = await bcrypt.hash(password, salt);  //      await becuase of the async

        await user.save();                                  // Save the user created in DB
        
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

