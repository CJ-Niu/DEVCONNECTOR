const express = require('express');
const request = require('request');
const config = require('config');

const router = express.Router();
const auth = require('../../middleware/auth');

const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

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
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    // if no profile
    if (!profile) {
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user!' });
    }

    res.json(profile);
  } catch (err) {
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
      check('status', 'Status is required!') // check for user status
        .not()
        .isEmpty(),

      check('skills', 'Skills is required') // check for user skills
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req); // check for errors
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
      linkedin,
    } = req.body; // pull everything out from body

    // Build profile object
    const profileFields = {};

    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      // skills needs to be an array
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    // Update && Insert the data
    try {
      let profile = await Profile.findOne({ user: req.user.id }); // user.id comes from the token

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
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    // check if profile exist
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found!' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found!' });
    }
    res.status(500).send('Server Error!');
  }
});

// Route to delete Profile or User
// @route               DELETE api/profile
// @description         Delete profile
// @access              Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove users posts
    await Post.deleteMany({ user: req.user.id });
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// Route to add Experience
// @route               PUT api/profile/experience
// @description         Add profile experience
// @access              Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required!').not().isEmpty(),
      check('company', 'Company is required!').not().isEmpty(),
      check('from', 'From date is required!').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // if errors exist
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // get body data
    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      // this will create an object with the date user submit
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    // Deal with mongoDB
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error!');
    }
  }
);

// Route to delete Experience
// @route               DELETE api/profile/experience/:exp_id
// @description         Delete experience from profile
// @access              Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    // get profile by user id
    const profile = await Profile.findOne({ user: req.user.id });
    // get remove index -- get correct experience
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    // remove
    profile.experience.splice(removeIndex, 1);
    // re-save profile
    await profile.save();
    // sending back response
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// Route to add Education
// @route               PUT api/profile/education
// @description         Add profile education
// @access              Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required!').not().isEmpty(),
      check('degree', 'Degree is required!').not().isEmpty(),
      check('fieldofstudy', 'Filed of study is required!').not().isEmpty(),
      check('from', 'From date is required!').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // if errors exist
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // get body data
    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newEdu = {
      // this will create an object with the date user submit
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    // deal with mongoDB
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error!');
    }
  }
);

// Route to delete Education
// @route               DELETE api/profile/education/:edu_id
// @description         Delete education from profile
// @access              Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    // get profile by user id
    const profile = await Profile.findOne({ user: req.user.id });
    // get remove index -- get correct education
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    // remove
    profile.education.splice(removeIndex, 1);
    // re-save profile
    await profile.save();
    // sending back response
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// Route to get user repos from Github
// @route               GET api/profile/github/:username
// @description         Get user repos from Github
// @access              Public
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc$client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,

      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      // if error
      if (error) {
        console.error(error);
      }
      // test status
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found!' });
      }
      // if found
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

module.exports = router; // export the route
