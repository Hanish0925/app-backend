const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const signUp = async (req, res) => {
  const { username, email, password, role } = req.body;

  const validRoles = ['user', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).send('Invalid role');
  }
  
  const user = new User({ username, email, password, role });
  try {
    await user.save();
    res.status(201).json({message : 'User created successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }

  const token = jwt.sign({ _id: user._id, role: user.role}, process.env.JWT_SECRET);
  res.send({token});
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send('Invalid username or password');
  };

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).send('Invalid username or password');
  };

  const token = jwt.sign({ _id: user._id, role: user.role}, process.env.JWT_SECRET);
  res.send({token});
};

module.exports = {
  signUp,
  signIn,
};