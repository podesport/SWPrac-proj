const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token || token == 'null') {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // console.log(decoded);
        // console.log("ee")
        req.user = await User.findById(decoded.id);

        // console.log(req.user);
        next();
    } catch (err) {
        console.error(err.stack);

        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

exports.authorize = (...roles) => {
    return (req,res,next) =>{
        // console.log(req.user)
        if(!roles.includes(req.user.role)){
            console.log(req.user);
            return res.status(403).json({ success: false, message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};