const express = require('express');
const router = express.Router();                            // express router
const auth = require('../../middleware/auth');              // middleware
const User = require('../../models/User');                  // user model

// @route               GET api/auth
// @description         Test route
// @access              Public (public route don't need a token, but private does)
router.get('/', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password');      // we don't want to return the user password, so '-password'
        res.json(user);
    } catch {
        console.error(err.message);
        res.status(500).send('Server Error!');
    }

});      // create a route

module.exports = router;                                    // export the route