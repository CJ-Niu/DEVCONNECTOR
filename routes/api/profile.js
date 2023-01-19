const express = require('express');
const router = express.Router();                                // express router
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');


// Test Route
// @route               GET api/profile
// @description         Test route
// @access              Public (public route don't need a token, but private does)
// router.get('/', (req, res) => res.send('Profile route'));     // create a route

// Route to get user profile
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


// Route to create or update user profile
// @route               POST api/profile
// @description         Create or update user profile
// @access              Private
router.post(
    '/', 
    [ 
        auth, 
        [
            check('status', 'Status is required!')              // check for user status
            .not()
            .isEmpty(),

            check('skills', 'Skills is required')               // check for user skills
            .not()
            .isEmpty()
        ] 
    ],
    async (req, res) => {

        const errors = validationResult(req);                   // check for errors
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;                                           // pull everything out from body

        // Build profile object
        const profileFields = {};

        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        
        if (skills) {                                           // skills needs to be an array
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // Build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        // Update && Insert the data
        try {
            let profile = await Profile.findOne({ user: req.user.id });   // user.id comes from the token

            // if profile already exist, we need to update it
            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                // return profile
                return res.json(profile);
            }

            // if profile not found, create new profile
            profile = new Profile(profileFields);

            await profile.save();
            // return profile
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error!');
        }
    }
);

// Route to get all profiles
// @route               GET api/profile
// @description         Get all profiles
// @access              Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }
});

// Route to get single profile by User ID
// @route               GET api/profile/user/:user_id
// @description         Get single profile by user ID
// @access              Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        // check if profile exist
        if(!profile) {
            return res.status(400).json({ msg: 'Profile not found!' })
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found!' })
        }
        res.status(500).send('Server Error!');
    }
});

module.exports = router;                                        // export the route