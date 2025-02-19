const express = require('express');
const router = express.Router();
const { signUp, login } = require('../controllers/users'); 
const { auth, checkRole } = require('../middleware/auth'); 

router.post('/signup', signUp);

router.post('/login', login);

router.get('/admin', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin' });
});

module.exports = router;
