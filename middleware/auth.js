const jwt = require('jsonwebtoken');
const config = require('config');               // since we need the secret

// exports
module.exports = function(req, res, next) {     // middleware function: function that have access to the request & response cycle / object
    
    // Get token from header
    const token = req.header('x-auth-token');

    // If no token at all
    if (!token) {
        return res.status(401).json({           // 401: not auth
            msg: 'No token, authorization denied!'
        })
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        
        req.user = decoded.user;                // take request object & assign a value to user
        next();
    } catch (err) {
    // If have token, but not valid
        res.status(401).json({ msg: 'Token is not valid!' });
    }
}