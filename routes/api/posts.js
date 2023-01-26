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

// Route to delete a single post
// @route               DELETE api/posts/:id
// @description         Delete a post
// @access              Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // check if post exist
        if (!post) {
            return res.status(404).json({ msg: 'Post not found!' });
        }

        // check make sure user OWN this post, before deleting it
        if (post.user.toString() != req.user.id) {
            return res.status(401).json({ msg: 'User not authorized!' });
        }

        // nothing wrong, remove post
        await post.remove();
        res.json({ msg: 'Post removed!' });
    } catch (err) {
        console.log(err.message);
        // privacy issue, if the pass in value is not an formatted object ID
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found!' });
        }
        res.status(500).send('Server Error!');
    }
});


// Route to like a post
// @route               PUT api/posts/like/:id
// @description         Like a post
// @access              Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        // get post
        const post = await Post.findById(req.params.id);
        // check if post has already been liked by this user
        if (post.likes.filter(like => like.user.toString() == req.user.id).length > 0) {        // length > 0, means its already been liked
            return res.status(400).json({ msg: 'Post already liked!' });
        }
        // add user's like
        post.likes.unshift({ user: req.user.id });
        // save
        await post.save();
        // return
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
});

// Route to unlike a post
// @route               PUT api/posts/unlike/:id
// @description         Like a post
// @access              Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        // get post
        const post = await Post.findById(req.params.id);
        // check if post has already been liked
        if (post.likes.filter(like => like.user.toString() == req.user.id).length == 0) {        // length == 0, means post haven't been liked yet
            return res.status(400).json({ msg: 'Poast has not yet been liked!' });
        }
        // get correct like's index to remove
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(res.user.id);
        // splice out the like
        post.likes.splice(removeIndex, 1);
        // save
        await post.save();
        // return
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
});


module.exports = router;                                    // export the route