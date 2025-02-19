const jwt = require('jsonwebtoken');
const User = require('../models/user'); 
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const auth = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access Denied. Please provide a valid token' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access Denied. Invalid token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded._id) {
            return res.status(400).json({ error: 'Invalid token structure: Missing user ID' });
        }
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(400).json({ error: 'Invalid token' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access Denied. You do not have the required permissions.' });
        }
        next();
    };
};

module.exports = { auth, checkRole };
