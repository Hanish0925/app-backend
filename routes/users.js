const express = require('express');
const router = express.Router();
const {signUp, signIn } = require('../controllers/users');
const auth = require('../middleware/auth');

// Sign-up route
router.post('/signup', signUp);

// Sign-in route
router.post('/signin', signIn);

// Admin route, accessible only to admins
router.get('/admin', auth('admin'), (req, res) => {
  res.send('Welcome Admin');
});

module.exports = router;