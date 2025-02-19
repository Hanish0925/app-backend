const jwt = require('jsonwebtoken');
const User = require('../models/user');

const signUp = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!User.isValidRole(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.isValidPassword(password))) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

module.exports = { signUp, login };
