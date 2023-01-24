const express = require('express');
const router = express.Router();                            // express router
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');                  // bring in all models
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route               GET api/posts
// @description         Test route
// @access              Public (public route don't need a token, but private does)
// router.get('/', (req, res) => res.send('Posts route'));  // create a route

// Route to create a post
// @route               POST api/posts
// @description         Create a post
// @access              Private (user have to login to create a post)
router.post(
    '/',
    [
        auth,
        [
            check('text', 'Text is required!')
                .not()
                .isEmpty
        ]
    ],
    async (req, res) => {
        // check for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        
        const user = await User
    }
);















module.exports = router;                                    // export the route