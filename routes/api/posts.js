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
                .isEmpty()
        ]
    ],
    async (req, res) => {
        // check for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const user = await User.findById(req.user.id).select('-password');

            const newPost = new Post ({
                text: req.body.text,            // text comes from body
                name: user.name,                // name comes from user
                avatar: user.avatar,            // avatar comes from user
                user: req.user.id               // user comes from req.user.id
            });

            const post = await newPost.save();

            res.json(post);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error!');
        }
    }
);

// Route to get all posts
// @route               GET api/posts
// @description         Get all posts
// @access              Private (user have to login to see posts)
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });     // sort post by the most recent one come first
        res.json(posts);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error!');
    }
});

// Route to get one single post
// @route               GET api/posts/:id
// @description         Get post by ID
// @access              Private (user have to login to see posts)
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        // check if post exist
        if (!post) {
            return res.status(404).json({ msg: 'Post not found!' });
        }

        res.json(post);
    } catch (err) {
        console.log(err.message);
        // privacy issue, if the pass in value is not an formatted object ID
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found!' });
        }
        res.status(500).send('Server Error!');
    }
});










module.exports = router;                                    // export the route