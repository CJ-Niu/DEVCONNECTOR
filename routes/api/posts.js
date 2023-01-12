const express = require('express');
const router = express.Router();                            // express router

// @route               GET api/posts
// @description         Test route
// @access              Public (public route don't need a token, but private does)
router.get('/', (req, res) => res.send('Posts route'));      // create a route

module.exports = router;                                    // export the route