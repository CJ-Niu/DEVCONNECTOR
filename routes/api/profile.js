const express = require('express');
const router = express.Router();                                // express router
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route               GET api/profile
// @description         Test route
// @access              Public (public route don't need a token, but private does)
// router.get('/', (req, res) => res.send('Profile route'));     // create a route

// route to get our profile
// @route               GET api/profile/me
// @description         Get current users profile
// @access              Private (getting profile by Token --> need auth middleware)
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        // if no profile
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user!' });
        }

        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
});

module.exports = router;                                        // export the route