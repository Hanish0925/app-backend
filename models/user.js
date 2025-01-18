const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bycrypt = require('bcrypt');

mongoose.userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email : {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
    default: 'user',
  },
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bycrypt.genSalt(10);
    this.password = await bycrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bycrypt.compare(password, this.password);
};

const user = mongoose.model('User', userSchema);

module.exports = user;
